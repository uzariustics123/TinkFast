# TinkFast

#### An online Platform conducting interactive digital quizes intended and dedicated to TCGC(Tangub City Global College)

![alt text](./src/assets/Screenshot.png "Screenshot")

## Partial Objectives

- Implement Login & Registration
- Create, Update, Delete Class
- Allow Joining others within a class via code or class id
  Example:
  - Teacher
  - Student
- Create, Update, Delete Quiz
- Create Quiestions within a quiz form.

### Quizes and Questions

- Customize each quizes and questions
  - Disallow students from starting a quiz unless started by the quiz facilitator.
  - Set question timer limit.
  - Creates reports automatically after quiz conducted.
  - View different matrix, reports, summary for quizes and students statistics.
  - Edit questions.
  - Choose different types of questions.
    - Matching Type
    - Essay
    - Selection

## Hotfixes:

### 1st Defence

- Admin
- Need fill in the blank and true or false sa quiz ✅
- Fill in the blank question type ✅
- True or false (no need true or false, this is acheivable via single choice with •true' or 'false' choices) ✅
- Dapat dili mas ubos sa starting time and date ang set na duration sa quiz • (disabled past dates and more...) ✅
- editable Quiz ✅
- Optimize charts and other performance analysis (Depends on the data created) ✅
- Recycle Quiz ✅
- Archiving sa quiz ✅
- File Export pdf and excel ✅
- magset of time during quizzes and exams, finish or unfinish mohatg nag score ✅
- Disable screenshot during quiz and exam (Try to implement lang ni) ✅
- Dili sigeg refresh ✅
- Sa multi choices if 2 ang given answer pilay ma score if 1 ray correct answer (already implemented) ✅
- Kwaon ang verification for testing lang sa daw na nga email ✅
- Changeable grading percentage for Quiz, PT and Exm ✅
- Dashboard ✅
- Tagoan tong mga random letters in each item sa quiz ✅

### 2nd Defence:

- Responsiveness in Admin Dashboard like if mag open sa sidebar dili ma push sa kilid ang rows ✅
- Password recovery and password display sa admin dashboard ✅
- Profile (basic) ✅
- Setting (basic) ✅
- Sa classes tab sa admin kay madisplay kinsay nag create sa class and member sa class ✅
- Same sa quizzes ma display aha nabelong na class ug kinsay gahimo ana na class ✅
- Fix ang date update sa quizzes since dili mo update ug tarong ang deadline sa quiz di pud ma display after quiz ✅
- Individual Viewing of Detailed Reports sa students

# Summary of added/updated features

- Admin dashboard with live viewing/updating Data table
- File Upload component (Using Supabase)
- Supabase API integration
- Fill in the blank component
- Timer Counted when starting a quis.
- Auto save quiz response when timer ends.
- Password recovery and display(Hashed)
- Recyclable Questions from another Quiz.
- Customizable timer.
- Individual viewing of detailed Reports for students.
- updated auto grading system.
- Added Settings (basic)
- Added Profile (Basic)

## Techs used

- Material UI MUI
- XMUI Datagrid
- Firebase
- Supabase
- Exceljs
- Neumorphism
- ReactJS
- SwiperJS
- CSS Utility Animations
- MUI Date Time Picker
- MUI Charts
- DaysJS
