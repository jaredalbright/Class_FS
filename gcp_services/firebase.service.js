const db = require("../db");

const format_user_res_data = (response) => {
    const data = response.docs.map((doc) => {
        return {id: doc.id, ...doc.data()}
    })

    const res = {}
    for (let x in data) {
        const event = data[x];
        const {id, ...rest} = event;
        if ('name' in event) {
            res[event.id] = {...rest}
        }
    }
    return res
}

exports.get_user_events = async (email) => {
    const user = await db.collection('users').doc(email).collection('events').get();
    const response = format_user_res_data(user);
    return response;
}

exports.add_user_fb = async (email, event, start, member_id, date, day, other_members) => {
    const user = db.collection('users').doc(email).collection('events').doc(event.event_id);
    console.log("MEMBER STUFF");
    console.log(member_id);
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
    const user = db.collection('users').doc(email).collection('events').doc(event_id);

    const doc = await user.get();
    if (doc.exists) {
        const res = await user.delete();
        console.log("Event Already Created for User");
        return true
    }
    else {
        console.log("Event Doesn't Exist");
        return false
    }

}