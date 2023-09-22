
--SELECT * FROM grade;
SELECT * FROM student;

SELECT c.ID, c.Name, c.ScheduleDay, g. ID 'GradeID', g.Name 'Grade'
FROM class c INNER JOIN grade g ON c.GradeID=g.ID ;

SELECT sc.ID, s.ID 'StudentID', s.Name, s.Paid, g.Name 'Grade', c.Name 'Class', c.ScheduleDay, sc.Is_In_Waiting
FROM student s INNER JOIN student_class sc ON s.ID=sc.Student_ID 
	INNER JOIN class c ON sc.Class_ID=c.ID INNER JOIN grade g ON c.GradeID=g.ID ;

SELECT s.ID, s.Name, s.Paid, g.Name 'Grade', c.Name 'Class', c.ScheduleDay 
FROM student s INNER JOIN student_class sc ON s.ID=sc.Student_ID 
	INNER JOIN class c ON sc.Class_ID=c.ID INNER JOIN grade g ON c.GradeID=g.ID 
WHERE s.ID='a79c8a40-53ee-11ee-a882-837a99481c6e'

