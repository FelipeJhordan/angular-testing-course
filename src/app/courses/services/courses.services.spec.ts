import { CoursesService } from "./courses.service"
import { TestBed } from '@angular/core/testing'
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { COURSES, findLessonsForCourse } from "../../../../server/db-data";
import { Course } from "../model/course";

describe('CoursesService', () => {
    let coursesService: CoursesService, httpTestingController: HttpTestingController
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                CoursesService,
                HttpClient
            ]
        })

        coursesService = TestBed.inject(CoursesService)
        httpTestingController = TestBed.inject(HttpTestingController)
    })

    it("should find a course by id", () => {
        coursesService.findAllCourses().subscribe(courses => {
            expect(courses).toBeTruthy("No courses returned")
            expect(courses.length).toBe(12, "incorrect number of courses")

            const course = courses.find(course => course.id == 12)

            expect(course.titles.description).toBe("Angular Testint Course")

            const req = httpTestingController.expectOne("/api/courses")
            expect(req.request.method).toEqual("GET")

            req.flush({
                payload: Object.values(COURSES)
            })

            httpTestingController.verify()
        })
    })
    it("should return the course", () => {
        const courseId = 12
        coursesService.findCourseById(courseId).subscribe(course => {
            expect(course).toBeTruthy("No curse returned")
            expect(course.id).toBe(courseId)

            const req = httpTestingController.expectOne(`/api/courses/${courseId}`)
            expect(req.request.method).toEqual("GET")


            req.flush(COURSES[12])
            httpTestingController.verify()
        })
    })

    it("should save the course", () => {
        const courseId = 12
        const productBuilt: Partial<Course> = {
            titles: {
                description: "Testint Course"
            }
        }
        coursesService.saveCourse(courseId, productBuilt).subscribe(course => {
            expect(course.id).toBe(12)
        })

        const req = httpTestingController.expectOne(`/api/courses/${courseId}`)
        expect(req.request.method).toEqual("PUT")

        expect(req.request.body.titles.description).toEqual(productBuilt.titles.description)

        req.flush({
            ...COURSES[12],
            ...productBuilt
        })
    })

    it("should give an error if save course fails", () => {
        const builtCourse: Partial<Course> = {
            titles: {
                description: 'Testing Course'
            }
        }

        coursesService.saveCourse(12, builtCourse)
            .subscribe(
                () => fail("the save course operation should have failed"), 
                (error: HttpErrorResponse) => {
                    expect(error.status).toBe(500)
                })

        const req = httpTestingController.expectOne(`/api/courses/${12}`)

        expect(req.request.method).toEqual("PUT")

        req.flush('Save course failed', {
            status:500,
            statusText: 'Internal Server Error'
        })
    })

    it("should find a list of lessons", () => {
        const courseId = 12

        coursesService.findLessons(courseId).subscribe(lessons => {
            expect(lessons).toBeTruthy()
            expect(lessons.length).toBe(3)
        })

        const req = httpTestingController.expectOne(req => req.url == "/api/lessons")

        expect(req.request.method).toEqual("GET")

        expect(req.request.params.get("courseId")).toEqual("12")
        expect(req.request.params.get("filter")).toEqual("")
        expect(req.request.params.get("sortOrder")).toEqual("asc")
        expect(req.request.params.get("pageSize")).toEqual("3")
        expect(req.request.params.get("pageNumber")).toEqual("0")

        req.flush({
            payload: findLessonsForCourse(courseId).slice(0,3)
        })
    })
})