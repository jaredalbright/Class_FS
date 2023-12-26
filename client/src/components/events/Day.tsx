import Hour from './Hour'

interface Props{
    day_obj: Object | any,
    date: string
}

const Day = ({day_obj, date} : Props) => {
    return (
        <div className='day-container'>
            <h5 className='event-card-align'>{date.replace(/^(\d{4})-(\d{2})-(\d{2})$/, "$2-$3")}</h5>
        {day_obj ? Object.keys(day_obj).map((hour, i) => (<Hour key={i} hour_obj={day_obj[hour]} time={hour}/>)) : <h3>Loading</h3>}
        </div>
    )
}

export default Day