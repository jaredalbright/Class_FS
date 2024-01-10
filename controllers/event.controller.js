const config = require("../config/db.config");
const db = require("../db");
const axios = require('axios');
const ltReq = require('../config/http.config')
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const { CloudSchedulerClient } = require('@google-cloud/scheduler');

const get_password = async (secretName) => {
    const client = new SecretManagerServiceClient();
    const path = client.secretVersionPath(config.projectId, "LTPassWord", secretName);
    const [version] = await client.accessSecretVersion({ name: path });
    const payload = version.payload.data.toString('utf8');

    return payload;
}

const time_conversion = (dateString, estTime) => {
    // Construct EST date object
    const estDateParts = dateString.split("-");
    const estTimeParts = estTime.split(":");

    const isPM = estTimeParts[1].includes("PM");

    const estDateTime = new Date(
      Date.UTC(
        parseInt(estDateParts[0]), // Year
        parseInt(estDateParts[1]) - 1, // Month (0-indexed)
        parseInt(estDateParts[2]), // Day
        (parseInt(estTimeParts[0]) + (isPM ? 12 : 0)) % 24, // Hour
        parseInt(estTimeParts[1])
      )
    );

    const oneWeekDateTime = new Date(estDateTime.getTime() - 7 * 24 * 60 * 60 * 1000);

    const estDay = oneWeekDateTime.day;
    const estMonth = oneWeekDateTime.month;
    const estYear = oneWeekDateTime.year;

    const isDstObserved = (
        (estMonth >= 3 && estMonth < 11) || // March to November (inclusive)
        (estMonth === 2 && estDay >= (14 - (estYear % 7))) || // Second Sunday of March
        (estMonth === 10 && estDay >= (7 - (estYear % 7))) // First Sunday of November
    );

    const utcTargetTime = new Date(oneWeekDateTime.getTime() + 60 * 60 * 1000 * (isDstObserved ? 4 : 5));

    // Format UTC date and time using 24-hour format
    const target = new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h24", // Use 24-hour clock format
        timeZone: "UTC", // Ensure UTC formatting
      }).format(utcTargetTime);

    const utcTriggerTime = new Date(utcTargetTime.getTime() - 60 * 1000);

    // Format UTC date and time using 24-hour format
    const formattedUtcDate = new Intl.DateTimeFormat("en-US", {
      month: "2-digit",
      day: "2-digit",
    }).format(utcTriggerTime);
    const formattedUtcTime = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h24", // Use 24-hour clock format
      timeZone: "UTC", // Ensure UTC formatting
    }).format(utcTriggerTime);

    console.log(formattedUtcTime, formattedUtcDate)
  
    return { formattedUtcTime, formattedUtcDate, target };
  };

// TODO Change out URLS for project and switch service account
const create_cloud_schedule = async (event_id, date, time, member_id, email) => {
    let time_date = await time_conversion(date, time);
    let utcTime = time_date.formattedUtcTime.split(":");
    let utcDate = time_date.formattedUtcDate.split("/");
    console.log(utcDate, utcTime);
    const location = config.functionRegion;

    const client = new CloudSchedulerClient();
    const parent = client.locationPath(config.projectId, location);
    const job = {
        name: parent + "/jobs/" + event_id + "_" + email.split("@")[0],
        description: `Generated event for ${email}`,
        schedule: `${utcTime[1]} ${utcTime[0]} ${utcDate[1]} ${utcDate[0]} *`,
        timeZone: 'UTC', 
        target: 'httpTarget',
        httpTarget: {
          uri: config.functionURL,
          httpMethod: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Google-Cloud-Scheduler'
          },
          body: Buffer.from(JSON.stringify({"event_id": event_id,"trigger_time":time_date.target, "member_id": member_id, "username": email})),
          oidcToken: {
            serviceAccountEmail: config.functionEmail,
            audience: config.functionURL, 
          }
        },
    }

    const [response] = await client.createJob({
            parent: parent,
            job: job,
          });

    return response
}

const add_user_fb = async (email, event) => {
    const user = db.collection('users').doc(email).collection('events').doc(event.event_id);
    
    const res = await user.update({
        'name': event.name,
        'start': event.start,
        'end': event.end,
        'location': event.location,
        'status': 'pending'
    })

    return res;
    
}

const gen_url = () => {
    const today = new Date();
    const one_week = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const two_weeks = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
    const oneWeekFormatted = one_week.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).split('/');
    const twoWeeksFormatted = two_weeks.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).split('/');
    const url = `/ux/web-schedules/v2/schedules/classes?start=${oneWeekFormatted[0]}%2F${oneWeekFormatted[1]}%2F${oneWeekFormatted[2]}&end=${twoWeeksFormatted[0]}%2F${twoWeeksFormatted[1]}%2F${twoWeeksFormatted[2]}&tags=format%3AClass&locations=Sky%20(Manhattan)&isFree=false&isLiveStreaming=false&facet=tags%3Ainterest%2Ctags%3AdepartmentDescription%2Ctags%3AtimeOfDay%2Ctags%3Aage%2Ctags%3AskillLevel%2Ctags%3Aintensity%2Cleader.name.displayname%2Clocation.name%2Ctags%3Aresource&page=1&pageSize=750&tags=interest:Pickleball`;
    return url;
}

const format_res_data = (full_res) => {
    let res_obj = {};
    for (day of full_res.data.results) {
        let date_obj = {};
        for (part of day.dayParts) {
            let timeObj = part.startTimes
            for (let time in timeObj) {
                let time_arr = [];
                let actObj = timeObj[time];
                for (let event_iter in actObj['activities']) {
                    let event = actObj['activities'][event_iter];
                    time_arr.push({
                        "event_id": event.id,
                        "name": event.name,
                        "location": event.location,
                        "paid": event.isPaidClass,
                        "start": time.time,
                        "end": event.endTime,
                    });
                };
                date_obj[actObj.time] = time_arr;
            };
        };
        res_obj[day.day] = date_obj;
    };
    return {"classes": res_obj};
}

exports.auth = async (req, res) => {
    try {
        if (req.body.email) {
            var token_v = req.body.email.split("@")[0];
            console.log(token_v)
            const password = await get_password(token_v);
            var data = JSON.stringify({"username": req.body.email, "password": password});
            ltReq.post("/auth/v2/login", data)
                .then(function (response) {
                    console.log(`Successfully retrieved ${config.gym} password for ${token_v}`)
                    res.status(200).send({x_ltf_profile: response.data.token, x_ltf_ssoid: response.data.ssoId});
                })
                .catch(function (error) {
                    console.log(error);
                });
            }
        else {
            res.status(400).send({message: "No password!"});
            return;
        }

    }
    catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Error" });
    }
}

exports.events = async (req, res) => {
    try {
        if (req.headers.x_ltf_profile && req.headers.x_ltf_ssoid) {
            ltReq.defaults.headers.common["x-ltf-profile"] = req.headers.x_ltf_profile;
            ltReq.defaults.headers.common["x-ltf-ssoid"] = req.headers.x_ltf_ssoid;
            ltReq.get(gen_url())
                .then(function (response) {
                    console.log(`Successfully retrieved 2 week data`);
                    const format_res = format_res_data(response)
                    res.status(200).send(format_res);
                })
                .catch(function (error) {
                    console.log(error);
                });
            }
        else {
            res.status(400).send({message: "Missing LT Auth"});
            return;
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Error" });
    }
}

exports.userEvents = async (req, res) => {
    try {
        
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Error" });
    }
}
exports.addEvent = async (req, res) => {
    try {
        if (req.body.email && req.body.event && req.body.start && req.body.member_id && req.body.date) {
            const event = req.body.event
            const create_job_res = await create_cloud_schedule(event.event_id, req.body.date, req.body.start, req.body.member_id, req.body.email);
            console.log(create_job_res);
            const response = await add_user_fb(req.body.email, event);
            console.log(response);
            res.status(201).send({message: "Successfully Created job"});
            return;
        }
        else {
            res.status(400).send({message: "Missing part or all of Payload"});
            return;
        }
        
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Error" });
    }
}
exports.updateEvent = async (req, res) => {
    try {
        
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Error" });
    }
}
exports.removeEvent = async (req, res) => {
    try {
        
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Error" });
    }
}