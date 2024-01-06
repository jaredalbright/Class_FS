import Hour from './Hour'

interface Props{
    day_obj: Object | any,
    date: string
}

const Day = ({day_obj, date} : Props) => {
    const get_day = (day : string) => {
        const weekday = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
        const d = new Date(day);
        return weekday[d.getDay()];
    }
    return (
        <div className='day-container'>
            <h5 className='event-card-align'>{get_day(date)}</h5>
            <h6 className='event-card-align'>{date.replace(/^(\d{4})-(\d{2})-(\d{2})$/, "$2-$3")}</h6>
        {day_obj ? Object.keys(day_obj).map((hour, i) => (<Hour key={i} hour_obj={day_obj[hour]} time={hour} e_date={date}/>)) : <h3>Loading</h3>}
        </div>
    )
}

export default Day