const config = require("../config/db.config");
const axios = require('axios');
const ltReq = require('../config/http.config')
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const { create_cloud_schedule, delete_cloud_schedule } = require('./../gcp_services/scheduler.service')
const { add_user_fb, delete_event_fb, get_user_events} = require('./../gcp_services/firebase.service')

const get_password = async (secretName) => {
    const client = new SecretManagerServiceClient();
    const path = client.secretVersionPath(config.projectId, "LTPassWord", secretName);
    const [version] = await client.accessSecretVersion({ name: path });
    const payload = version.payload.data.toString('utf8');
    return payload;
}

const gen_url = () => {
    const today = new Date();
    const one_week = new Date(today.getTime() + 8 * 24 * 60 * 60 * 1000);
    const two_weeks = new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000);
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
            const password = await get_password(token_v);
            var data = JSON.stringify({"username": req.body.email, "password": password});
            ltReq.post("/auth/v2/login", data)
                .then(function (response) {
                    console.log(`Successfully retrieved ${config.gym} token for ${token_v}`)
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
        if (req.headers.email) {
            const response = await get_user_events(req.headers.email);
            console.log(`Successfully retrieved User data`);
            res.status(200).send(response);
        }
        
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Error" });
    }
}
exports.addEvent = async (req, res) => {
    try {
        if (req.body.email && req.body.event && req.body.start && req.body.member_id && req.body.date && req.body.day && req.body.other_members) {
            const event = req.body.event
            const create_job_res = await create_cloud_schedule(event.event_id, req.body.date, req.body.start, req.body.member_id, req.body.email);
            if (!create_job_res) {
                res.status(400).send({message: "Unable to Create Schedule: Could Be Duplicate"});
                return
            }
            console.log(req.body.other_members);
            const response = await add_user_fb(req.body.email, event, req.body.start, req.body.member_id, req.body.date, req.body.day, req.body.other_members);
            if (response) {
                res.status(201).send({message: "Successfully Created job"});
            }
            else {
                res.status(400).send({message: "Cannot Add to Database due to Firebase Error"});
            }
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
        if (req.headers.event_id && req.headers.email) {
            if (await delete_cloud_schedule(req.headers.event_id, req.headers.email))
            {
                if (await delete_event_fb(req.headers.email, req.headers.event_id)) {
                    res.status(202).send({ message: "Event Deleted" });
                }
                else {
                    res.status(500).send({ message: "Failure to Delete Database Entry" });
                }
            }
            else {
                res.status(500).send({ message: "Failure to Delete Schedule" });
            }
        }
        else {
            res.status(400).send({ message: "Missing Headers" });
        }
        
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Error" });
    }
}