## Users:
// rollno, college, year, sem, branch
{
	"_id": "objectId",
	"name": "John",
	"email": "john@example.com",
	"password": "hashed_pw"
}

## time_tables:

{
	"_id":"objectId",
	"userId": "objectId",
	startTime: "09:00",
	endTime: "04:30",
	classTime: "00:45",
	labTime: "01:00",
	lunchBreak: {startTime: "12:45", endTime: "14:00"}
	"days":
	{
		"Monday":
		[
			{"1": "Math"},
			{"2": "Physics"}
		],
		"Tuesday": 
		[ 
			... 
		],
		...
	}
}

## Attendance:

{
	"_id": "ObjectId",
	"userId": "ObjectId",
	"date": "2025-05-20",
	"classes": 
	[
		{ "slotId": "09:00", "subjectId": "Math", "status": "present" },
		{ "slotId": "10:00", "subjectId": "Physics", "status": "absent" }
	]
}

## Dashboard:
{
	"userId": ObjectId,
	"totalClasses": Number,
	"attendedClasses": Number,
	"subjects": [
		{"subjectId": subID1, "totalClasses": count1, "present": val, "absent": val},
		{"subjectId": subID2, "totalClasses": count2, "present": val, "absent": val}
	]
}

