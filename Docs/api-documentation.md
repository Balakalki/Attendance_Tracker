# API Documentation

## Authentication
- 'POST /api/auth/signup'
- 'POST /api/auth/login'
- 'POST /api/auth/chek'


## Timetable Management
- 'POST /api/timetable' - Create user timetable
- 'GET /api/timetable/:userId' - Get user timetable
- 'PUT /api/timetable/:userId' - Update timetable


## Attendance Management:
- 'GET /api/attendance/:userId/:date' - Get attendance for a specific day
- 'POST /api/attendance' Mark attendance for current or past day
	- Body:
		json
		{
			"userId": '123',
			"date": '2025-05-20',
			"classes:
			[
				{"time": '09:00', "subject": 'math', "status": 'present'},
				{"time": '10:00', "subject": 'Physics', "status": 'absent'}
			]
		}
	
- 'PUT /api/attendance/:userId/:date' - Modify attendance for a given day



## Bunk calculator
- 'GET /api/bunks/:userId' - Return how many classes a student can skip to stay above 75% and 65% respectively.

