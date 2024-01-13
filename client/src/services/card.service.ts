const checkPlusOne = (text: string) => {
    const index = text.indexOf("Each member that signs up bring 1 member");

    if (index !== -1) {
        return true;
    }
    return false;
}

export const eventNameParse = (text: string) => {
    let parsed_text = text;
    const plusOne = checkPlusOne(text);

    const range = new RegExp("\\d+\\.\\d+-\\d+\\.\\d+");
    const range_m = text.match(range);

    const above = new RegExp("\\d+\\.\\d+\\+");
    const above_m = text.match(above);

    if (text.toUpperCase().indexOf("ALL LEVELS") !== -1 || text.indexOf("Pickleball Open Play: Drill and Play") !== -1) {
        parsed_text = "All Levels Play"
    }

    if (range_m) {
        parsed_text = "DUPR range: " + range_m[0];
    }
    else if (above_m) {
        parsed_text = "DUPR: " + above_m[0];
    }

    if (text.indexOf("NR") !== -1) {
        parsed_text = parsed_text + " and NR"
    }

    if (plusOne) {
        parsed_text = parsed_text + " (PLUS 1)"
    }

    return parsed_text
}