## Users:

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
	"days":
	{
		"Monday":
		[
			{"time": "09:00", "subject": "Math"},
			{"time": "10:00", "subject": "Physics"}
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
		{ "time": "09:00", "subject": "Math", "status": "present" },
		{ "time": "10:00", "subject": "Physics", "status": "absent" }
	]
}

