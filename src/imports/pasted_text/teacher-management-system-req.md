  	PROJECT REQUIREMENT DOCUMENT
KPI Web Software — School Teacher Management System
Document Classification:
Version 1.0
April 2025
1. Project Overview
This document outlines the comprehensive requirements for the KPI Web Software, a cloud-based Teacher Management System designed for educational institutions. The system aims to digitize and streamline all aspects of teacher administration, from onboarding through exit management.
1.1 Objectives
Manage the complete teacher lifecycle from joining to exit
Automate performance evaluation through an ACR-based system
Streamline payroll processing and attendance tracking
Facilitate administrative workflows and reporting
2. User Roles & Permissions
The system implements a role-based access control (RBAC) model to ensure data security and appropriate information access for all stakeholders.
2.1 Defined Roles
#
Role
Primary Responsibility
1
Super Admin
Full system access; configuration and oversight of all modules
2
Principal (Authority)
Institutional oversight; access to confidential evaluation remarks
3
HR / Admin Staff
Teacher profile management, attendance tracking, task assignment
4
Teacher
Read-only access to personal records, leave applications, task views
5
Accounts / Finance Officer
Payroll processing, salary disbursement, loan management


2.2 Permission Logic
Principal — Can view all confidential ACR remarks and full evaluation data
Teacher — Restricted to personal profile, own attendance, and own payslips only
HR / Admin — Can manage teacher profiles, attendance records, and task assignments
Accounts Officer — Access limited to payroll, salary, and loan-related modules

3. Core Modules
The system comprises nine integrated modules, each addressing a distinct operational area of teacher management. All modules are interconnected and share a common data layer.

3.1 Employee Information Management 
Centralizes all teacher-related biographical, professional, and administrative information in a single structured repository.

Onboarding Form Fields
Full name, residential address, and contact information
Academic and professional qualifications
National ID / Government-issued identification number
Official joining date and employment type

Auto-Generated Documents
Appointment letter (auto-generated PDF upon onboarding completion)

Classification Tags
Department assignment
Subject expertise mapping
Employment type: Full-time / Part-time / Contract

Advanced Profile Features
Visual experience timeline (career progression view)
Certification and credential document upload
Training history and professional development log

3.2 Staff Attendance & Time Tracking
Provides a comprehensive attendance management system supporting both manual entry and system-based logging, with automated calculations for key time metrics.

Check-In / Check-Out Methods
Manual entry by HR / Admin staff
System login-based automatic check-in and check-out
Full entry and exit log with timestamps

Automated Calculations
Metric
Description
Total Working Hours
Cumulative hours logged per day, week, and month
Late Entry Detection
Flags arrivals beyond the defined shift start time
Early Exit Detection
Flags departures before the defined shift end time
Overtime Calculation
Calculates hours worked beyond standard shift duration


Note: Biometric device integration is explicitly excluded from the current scope as per stated requirements.

3.3 Performance & Evaluation Engine (ACR)
Manages the Annual Confidential Report (ACR) process with a structured, privacy-enforced multi-reviewer evaluation framework.

Yearly performance dashboard with historical trend analysis
KPI-based structured evaluation criteria

ACR Remark Types & Access Control
Remark Type
Visibility
Purpose
Confidential
Principal only
Sensitive reviewer observations not disclosed to other parties
Internal
Admin view only
Operational notes for HR and administrative reference
General
Teacher-visible
Constructive feedback accessible to the evaluated teacher


Privacy Controls
Multiple authority reviewers may participate in a single ACR cycle
Strict isolation: no reviewer can view the remarks of another reviewer

Outputs
Yearly performance comparison chart
Promotion recommendation support documentation

3.4 Salary & Payroll System
Automates all payroll calculations and generates auditable salary records with full breakdown transparency.

Component
Details
Base Salary
Fixed monthly compensation as per employment agreement
Overtime Pay
Calculated from attendance module overtime records
Fixed Bonus
Predetermined bonus disbursements (e.g., festival allowance)
Performance Bonus
Linked to ACR evaluation scores and KPI achievement
Leave Deductions
Deductions applied for unapproved or excess leave taken
Advance Salary
Tracks and recovers salary advances disbursed to teachers


Outputs
Auto-generated payslip (PDF format, per pay period)
Full salary history tracking and audit trail

3.5 Leave Management System
Provides a structured leave request, approval, and substitute assignment workflow to ensure uninterrupted academic operations.

Teacher-initiated leave application submission
Two-tier approval workflow: Admin review followed by Principal approval

Smart Substitute Assignment
When a leave is approved, the system automatically suggests suitable substitute teachers based on the following criteria:
Subject expertise match with the absent teacher
Current availability status (no conflicting duties)
Workload balance to prevent overburdening available staff

3.6 Task & Responsibility Management
Enables systematic assignment, tracking, and completion of institutional responsibilities beyond regular teaching duties.

Task Categories
Examination duty coordination
Institutional event management
Administrative and operational work orders

Features & Workflow
Feature
Description
Task Assignment
Assign tasks to individual teachers or groups with defined scope
Deadline Tracking
Monitor task progress against set completion deadlines
Status Management
Track tasks through: Pending → Ongoing → Completed stages
Notifications
Automated alerts triggered as task deadlines approach


3.7 Discipline Tracking
Maintains a structured record of disciplinary incidents and complaints, supporting institutional governance and due process.

Formal complaint logging with teacher tagging capability
Structured incident report documentation

Student Complaint Workflow
Complaint is formally tagged to the relevant teacher's record
Automated SMS notification dispatched to concerned parties upon complaint registration

3.8 Shift Management
Organizes teacher scheduling across defined shift types, supporting structured timetabling and shift adjustment processes.

Feature
Description
Shift Types
Morning, Day, and Evening shift categories supported
Shift Assignment
Admin assigns teachers to shifts based on schedule
Shift Change Request
Teachers may formally request shift changes through the system
Approval Workflow
Shift change requests route through Admin / Principal approval


3.9 Teacher Exit Management
Manages the formal offboarding process, ensuring all administrative, financial, and documentation requirements are fulfilled prior to a teacher's departure.

Exit interview form capturing reasons and feedback

Final Settlement Components
Outstanding salary calculation and disbursement
Loan balance adjustment and recovery reconciliation
Document clearance checklist and issuance

4. Module Summary
The following table provides a consolidated reference for all system modules and their operational scope.

#
Module
Key Capabilities
3.1
Teacher Profile Management
Onboarding, document generation, tagging, experience timeline
3.2
Attendance & Time Tracking
Check-in/out logs, late/early detection, overtime computation
3.3
Performance Evaluation (ACR)
KPI evaluation, multi-reviewer ACR, confidential remarks, charts
3.4
Salary & Payroll
Salary components, advance tracking, payslip generation
3.5
Leave Management
Application workflow, approvals, smart substitute suggestion
3.6
Task & Responsibility
Assignment, deadline tracking, status workflow, notifications
3.7
Discipline Tracking
Complaint logging, incident reports, SMS notifications
3.8
Shift Management
Shift types, assignment, change requests, approval workflow
3.9
Teacher Exit Management
Exit interview, final salary settlement, loan reconciliation


5. Document Control
Version
Date
Status
Prepared By
1.0
April 2025
Draft — For Review
Project Team


This document is subject to revision as project requirements are refined through stakeholder consultation and technical feasibility assessment.
