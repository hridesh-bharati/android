// src/dashboard/student/Certificate/courseData.js
export const staticCourses = [
    {
        id: 0,
        name: "ADCA+",
        fullName: "Advanced Diploma in Computer Applications+",
        duration: 18,
        category: "computer",
        subjects: [
            { id: 1, name: "Computer Fundamentals" }, { id: 2, name: "Operating System" },
            { id: 3, name: "MS Word" }, { id: 4, name: "MS Excel" }, { id: 5, name: "MS PowerPoint" },
            { id: 6, name: "MS Access" }, { id: 7, name: "Tally Prime with GST" }, { id: 8, name: "Internet & Email" },
            { id: 9, name: "Photoshop" }, { id: 10, name: "PageMaker" }, { id: 11, name: "Corel Draw" },
            { id: 12, name: "C Programming" }, { id: 13, name: "C++ Programming" }, { id: 14, name: "HTML" },
            { id: 15, name: "CSS" }, { id: 16, name: "JavaScript" }, { id: 17, name: "Computer Virus & Security" },
            { id: 18, name: "Hardware & Its Faults" }, { id: 19, name: "W3.CSS Framework" }, { id: 20, name: "Angular JS" },
            { id: 21, name: "Python Programming" }, { id: 22, name: "Assignments" }, { id: 23, name: "Major Project" }
        ]
    },
    {
        id: 1,
        name: "ADCA",
        fullName: "Advanced Diploma in Computer Applications",
        duration: 15,
        category: "computer",
        subjects: [
            { id: 1, name: "Computer Fundamentals" }, { id: 2, name: "Operating System" },
            { id: 3, name: "MS Word" }, { id: 4, name: "MS Excel" }, { id: 5, name: "MS PowerPoint" },
            { id: 6, name: "MS Access" }, { id: 7, name: "Tally Prime with GST" }, { id: 8, name: "Internet & Email" },
            { id: 9, name: "Photoshop" }, { id: 10, name: "PageMaker" }, { id: 11, name: "Corel Draw" },
            { id: 12, name: "C Programming" }, { id: 13, name: "C++ Programming" }, { id: 14, name: "HTML" },
            { id: 15, name: "CSS" }, { id: 16, name: "JavaScript" }, { id: 17, name: "Computer Virus & Security" },
            { id: 18, name: "Hardware & Its Faults" }, { id: 19, name: "Projects" }
        ]
    },
    {
        id: 2,
        name: "DCA",
        fullName: "Diploma in Computer Applications",
        duration: 12,
        category: "Diploma",
        subjects: [
            { id: 1, name: "Computer Fundamentals" }, { id: 2, name: "Operating System" },
            { id: 3, name: "MS Word" }, { id: 4, name: "MS Excel" }, { id: 5, name: "MS PowerPoint" },
            { id: 6, name: "MS Access" }, { id: 7, name: "Internet & Email" }, { id: 8, name: "Tally Prime with GST" },
            { id: 9, name: "Photoshop" }, { id: 10, name: "PageMaker" }, { id: 11, name: "Corel Draw" },
            { id: 12, name: "C Programming" }, { id: 13, name: "C++ Programming" }, { id: 14, name: "Project Work" }
        ]
    },
    {
        id: 3,
        name: "DCAA",
        fullName: "Diploma in Computer Applications & Accountancy",
        duration: 6,
        category: "Diploma",
        subjects: [
            { id: 1, name: "Computer Fundamentals" }, { id: 2, name: "Operating System" },
            { id: 3, name: "MS Word" }, { id: 4, name: "MS Excel" }, { id: 5, name: "MS PowerPoint" },
            { id: 6, name: "MS Access" }, { id: 7, name: "Tally Prime with GST" }, { id: 8, name: "Internet & Email" }
        ]
    },
    {
        id: 13,
        name: "DTP",
        fullName: "Diploma in Desktop Publishing",
        duration: 6,
        category: "DDTP Course",
        subjects: [
            { id: 1, name: "Computer Fundamentals" }, { id: 2, name: "Operating System" },
            { id: 3, name: "MS Word" }, { id: 4, name: "MS Excel" }, { id: 5, name: "MS PowerPoint" },
            { id: 6, name: "Adobe Photoshop" }, { id: 7, name: "CorelDRAW" }, { id: 8, name: "PageMaker" }
        ]
    },
    {
        id: 14,
        name: "CCC",
        fullName: "Course on Computer Concepts",
        duration: 3,
        category: "nielit",
        subjects: [
            { id: 1, name: "Introduction to Computer" }, { id: 2, name: "Operating System" },
            { id: 3, name: "Word Processing" }, { id: 4, name: "Spreadsheet" }, { id: 5, name: "Presentation" },
            { id: 6, name: "Internet & WWW" }, { id: 7, name: "Email & Social Media" }
        ]
    },
    {
        id: 15,
        name: "O LEVEL",
        fullName: "NIELIT O Level Information Technology Course",
        duration: 12,
        category: "nielit",
        subjects: [
            { id: 1, name: "IT Tools & Business Systems" }, { id: 2, name: "Internet & Web Designing" },
            { id: 3, name: "Programming & Problem Solving" }, { id: 4, name: "Internet of Things (IoT)" }, { id: 5, name: "Project Work" }
        ]
    }
];

export const getCourseDetails = (courseName) => {
    if (!courseName) {
        return {
            fullName: "Diploma in Computer Applications",
            durationMonths: "12 Months",
            hours: "480 Hrs.",
            modules: ["Computer Fundamentals", "Operating System", "MS Word", "MS Excel", "MS PowerPoint", "MS Access", "Internet & Email", "Tally Prime with GST", "Photoshop", "PageMaker", "Corel Draw", "C Programming", "C++ Programming", "Project Work"]
        };
    }

    const cleanInputName = courseName.toUpperCase().trim();
    const foundCourse = staticCourses.find(c => c.name.toUpperCase().trim() === cleanInputName) ||
                        staticCourses.find(c => cleanInputName.includes(c.name.toUpperCase().trim()));

    if (foundCourse) {
        const modulesList = foundCourse.subjects.map(sub => sub.name);
        const durationMonthsVal = `${foundCourse.duration} Months`;
        
        let hoursVal = "480 Hrs.";
        if (foundCourse.duration === 18) hoursVal = "720 Hrs.";
        else if (foundCourse.duration === 15) hoursVal = "580 Hrs.";
        else if (foundCourse.duration === 12) hoursVal = "480 Hrs.";
        else if (foundCourse.duration === 6) hoursVal = "230 Hrs.";
        else if (foundCourse.duration <= 3) hoursVal = "120 Hrs.";

        return {
            fullName: foundCourse.fullName || courseName,
            durationMonths: durationMonthsVal,
            hours: hoursVal,
            modules: modulesList
        };
    }

    return {
        fullName: courseName,
        durationMonths: "12 Months",
        hours: "480 Hrs.",
        modules: [
            "Computer Fundamentals", "Operating System", "MS Word", "MS Excel", "MS PowerPoint",
            "MS Access", "Internet & Email", "Tally Prime with GST", "Photoshop", "PageMaker",
            "Corel Draw", "C Programming", "C++ Programming", "Project Work"
        ]
    };
};