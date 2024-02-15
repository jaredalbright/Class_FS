const db = require("../db");
const config = require("../config/db.config");
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const { delete_cloud_schedule } = require("./scheduler.service");

exports.get_secret = async () => {
    const client = new SecretManagerServiceClient();
    const path = client.secretVersionPath(config.projectId, "jwtSecret", "latest");
    const [version] = await client.accessSecretVersion({ name: path });
    const payload = version.payload.data.toString('utf8');
    return payload;
}

// TODO SORT DATA, maybe return array instead? 
const format_user_res_data = async (response, email) => {
    const data = response.docs.map((doc) => {
        return {id: doc.id, ...doc.data()}
    })

    const res = {}
    // Parsing out incorrect data
    for (let x in data) {
        const event = data[x];
        const {id, ...rest} = event;
        if (('name' in event) && ('date' in event) && await filter_old_events(event, email)) {
            res[event.id] = {...rest}
        }
    }
    return res
}

//The efficienty of this already sucks so I am not going to get the date perfect
//Keep it at an estimate
const filter_old_events = async (event, email) => {
    const date = event.date.split("-");
    const eventDate = new Date(
        Date.UTC(
          parseInt(date[0]), // Year
          parseInt(date[1]) - 1, // Month (0-indexed)
          parseInt(date[2]) - 6, // Day
        )
      );
    const today = new Date();
    
    if (today > eventDate) {
        if (await delete_cloud_schedule(event.id, email))
            {
                if (await delete_event_fb_internal(email, event.id)) {
                    return false;
                }
                else {
                    return true;
                }
            }
        else {
            return true;
        }
    }
    
    return true;
}

exports.get_user_events = async (email) => {
    const user = await db.collection('users').doc(email).collection('events').get();
    const response = await format_user_res_data(user, email);
    return response;
}

exports.add_user_fb = async (email, event, start, member_id, date, day, other_members) => {
    const user = db.collection('users').doc(email).collection('events').doc(event.event_id);
    const doc = await(user.get());
    if (doc.exists) {
        console.log("Event Already Created for User");
        return false
    }

    try {
        await user.set({
            name: event.name,
            start: start,
            end: event.end,
            location: event.location,
            member_id: member_id,
            other_members: other_members,
            date: date,
            day: day,
            status: 'pending'
            })
        return true;
    }
    catch {
        return false
    }
    
}

exports.delete_event_fb = async(email, event_id) => {
    return delete_event_fb_internal(email, event_id)
}

const delete_event_fb_internal = async(email, event_id) => {
    const user = db.collection('users').doc(email).collection('events').doc(event_id);

    const doc = await user.get();
    if (doc.exists) {
        const res = await user.delete();
        return true
    }
    else {
        console.log("Event Doesn't Exist");
        return false
    }

}