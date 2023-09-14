
--SELECT * FROM grade;

--SELECT * FROM class c INNER JOIN grade g ON c.GradeID=g.ID ;

SELECT s.ID, s.Name, s.Paid, c.Name 'Class', g.Name 'Grade'
FROM student s INNER JOIN student_class sc ON s.ID=sc.Student_ID 
	INNER JOIN class c ON sc.Class_ID=c.ID INNER JOIN grade g ON c.GradeID=g.ID ;