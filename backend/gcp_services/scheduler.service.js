const { CloudSchedulerClient } = require('@google-cloud/scheduler');
const config = require("../config/db.config");

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

    //console.log(estDateTime)
    
    // the bookings are now 7 days and 22 hours
    const utcTargetTime = new Date(estDateTime.getTime() - ((7 * 24) + 22 - 4) * 60 * 60 * 1000);

    //console.log(utcTargetTime)

    //const utcTargetTime = new Date(oneWeekDateTime.getTime() + 60 * 60 * 1000 * 4); //DST

    // Format UTC date and time using 24-hour format
    const target = new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23", // Use 24-hour clock format
        timeZone: "UTC", // Ensure UTC formatting
      }).format(utcTargetTime);

    //console.log(target)

    const utcTriggerTime = new Date(utcTargetTime.getTime() - 60 * 1000);

    // Format UTC date and time using 24-hour format
    const formattedUtcDate = new Intl.DateTimeFormat("en-US", {
      month: "2-digit",
      day: "2-digit",
      hourCycle: "h23", // Use 24-hour clock format
      timeZone: "UTC", // Ensure UTC formatting
    }).format(utcTriggerTime);
    const formattedUtcTime = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23", // Use 24-hour clock format
      timeZone: "UTC", // Ensure UTC formatting
    }).format(utcTriggerTime);
  
    return { formattedUtcTime, formattedUtcDate, target };
  };

exports.create_cloud_schedule = async (event_id, date, time, member_id, email) => {
    let time_date = await time_conversion(date, time);
    let utcTime = time_date.formattedUtcTime.split(":");
    let utcDate = time_date.formattedUtcDate.split("/");
    const location = config.functionRegion;
    

    const client = new CloudSchedulerClient();
    const parent = client.locationPath(config.projectId, location);
    const job = {
        name: parent + "/jobs/" + event_id.replace(/\W/g, '') + "_" + email.split("@")[0],
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

    try {
        const [response] = await client.createJob({
                parent: parent,
                job: job,
            });
        return true
    }
    catch (error) {
        console.log(error);
        return false
    }
}

exports.delete_cloud_schedule = async (event_id, email) => {
  const location = config.functionRegion;
  const client = new CloudSchedulerClient();
  const parent = client.locationPath(config.projectId, location);
  const name = parent + "/jobs/" + event_id.replace(/\W/g, '') + "_" + email.split("@")[0]
  const request = {
    name,
  }

  try {
    const [response] = await client.deleteJob(request);
    return true
  }
  catch {
    return false
  }
}
