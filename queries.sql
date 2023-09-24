
--SELECT * FROM grade;
SELECT * FROM student;

SELECT c.ID, c.Name, c.ScheduleDay, g. ID 'GradeID', g.Name 'Grade'
FROM class c INNER JOIN grade g ON c.GradeID=g.ID ;

SELECT sc.ID, s.ID 'StudentID', s.Name, s.Paid, g.Name 'Grade', c.Name 'Class', c.ScheduleDay, sc.Is_In_Waiting, sc.Added_In_Waiting_On
FROM student s INNER JOIN student_class sc ON s.ID=sc.Student_ID 
	INNER JOIN class c ON sc.Class_ID=c.ID INNER JOIN grade g ON c.GradeID=g.ID 
ORDER BY g.Name, s.Name;

SELECT sc.ID, s.ID 'StudentID', s.Name, CAST(s.Paid AS TEXT) Paid, g.ID 'GradeID', g.Name 'Grade', c.ID 'ClassID', c.Name 'Class', c.ScheduleDay, a.Date
FROM student s INNER JOIN student_class sc ON s.ID=sc.Student_ID 
INNER JOIN class c ON sc.Class_ID=c.ID INNER JOIN grade g ON c.GradeID=g.ID
LEFT JOIN attendance a ON a.Student_Class_ID=sc.ID
WHERE Is_In_Waiting=0 
ORDER BY g.Name, s.Name;

			