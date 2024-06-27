import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, UnprocessableEntityException, ValidationPipe } from "@nestjs/common";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import * as pactum from "pactum";
import * as path from "path"
import { useContainer } from "class-validator";

describe('App (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        stopAtFirstError: true,
        exceptionFactory: (errors) => {
          return new UnprocessableEntityException({
            success: false,
            message: 'Validation failed',
            fails: errors.reduce(
              (acc, e) => ({
                ...acc,
                [e.property]: Object.values(e.constraints),
              }),
              {},
            ),
          })
        }}));
    useContainer(app.select(AppModule), {fallbackOnErrors: true})
    await app.init();
    await app.listen(3000);

    prisma = app.get(PrismaService)


    await prisma.cleanDb()
    await prisma.seedDb()
    pactum.request.setBaseUrl("http://localhost:3000/api/v1")
  });

  afterAll(async () => {
    await app.close();
  });

  describe("Position", () => {
    it("should return all users positions", () => {
      return pactum
        .spec()
        .get('/positions')
        .expectStatus(200)
        .expectJsonMatch({
          success: true,
          positions: [
            { name: "Lawyer" },
            { name: "Content manager" },
            { name: "Security" },
            { name: "Designer" }
          ]
        })
        .stores('position_id', 'positions[0].id');
    });
  });

  describe("Token", () => {
    it("should return token", () => {
      return pactum
        .spec()
        .get('/token')
        .expectStatus(200)
        .expectJsonLike(
          {
            success: true,
            token: /[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/
          })
        .stores("authToken", 'token')
    });
  });

  describe("User", () => {

    it("should return the user's new registered user", () => {
      return pactum
        .spec()
        .post('/users')
        .withHeaders({
          Authorization: `Bearer $S{authToken}`
        })
        .withMultiPartFormData({
          name: "John Doe",
          email: "john9999@email.com",
          phone: "380500770555",
          position_id: `$S{position_id}`
        })
        .withFile('photo', path.resolve(__dirname, 'image/test-img.jpg'))
        .expectStatus(201)
        .expectJsonLike({
          success: true,
          message: "New user successfully registered"
        })
        .stores("userId", "user_id")

    })

    it("should throw error phone or email already exist", () => {
      return pactum
        .spec()
        .post('/users')
        .withHeaders({
          Authorization: `Bearer $S{authToken}`
        })
        .withMultiPartFormData({
          name: "John Doe",
          email: "john9999@email.com",
          phone: "380500770555",
          position_id: `$S{position_id}`
        })
        .withFile('photo', path.resolve(__dirname, 'image/test-img.jpg'))
        .expectStatus(409)
        .expectBody({
          success: false,
          message: "User with this phone or email already exist"
        })
    })


    it("should throw error validation failed", () => {
      return pactum
        .spec()
        .post('/users')
        .withHeaders({
          Authorization: `Bearer $S{authToken}`
        })
        .withMultiPartFormData({
          name: "J",
          email: "john1test.com",
          position_id: "Designer"
        })
        .withFile('photo', path.resolve(__dirname, 'image/test-img.jpg'))
        .expectStatus(422)
        .expectBody({
          success: false,
          message: "Validation failed",
          fails: {
            name: [
              "The name must be at least 2 characters."
            ],
            email: [
              "The email must be a valid email address."
            ],
            phone: [
              "The phone field is required."
            ],
            position_id: [
              "The position id must be an integer."
            ]
          }
        })
    })


    it("should throw error token expired", () => {
      return pactum
        .spec()
        .post('/users')
        .withHeaders({
          Authorization: `Bearer eyJpdiI6Im9mV1NTMlFZQTlJeWlLQ3liVks1MGc9PSIsInZhbHVlIjoiRTJBbUR4dHp1dWJ3`
        })
        .withMultiPartFormData({
          name: "John Doe1",
          email: "john11@email.com",
          phone: "380500170855",
          position_id: `$S{position_id}`
        })
        .withFile('photo', path.resolve(__dirname, 'image/test-img.jpg'))
        .expectStatus(401)
        .expectBody({
          success: false,
          message: "The token expired."
        })
    })


    it("should return user list by page and count", () => {
      const page = 2
      const count = 10;
      return pactum
        .spec()
        .get('/users')
        .withQueryParams("page", page)
        .withQueryParams("count", count)
        .expectStatus(200)
        .expectJsonLike(
          {
            success: true,
            count: count,
            page: page
          }).expectJsonLength("users", count)

    });


    it("should throw error page not found", () => {
      const page = 9999
      const count = 10;
      return pactum
        .spec()
        .get('/users')
        .withQueryParams("page", page)
        .withQueryParams("count", count)
        .expectStatus(404)
        .expectBody(
          {
            success: false,
            message: "Page not found"
          })

    });

    it("should throw page, count validation failed", () => {
      return pactum
        .spec()
        .get('/users')
        .withQueryParams("page", 0)
        .withQueryParams("count", "one")
        .expectStatus(422)
        .expectBody(
          {
            success: false,
            message: "Validation failed",
            fails: {
              count: [
                "The count must be an integer."
              ],
              page: [
                "The page must be at least 1."
              ]
            }
          })

    });

    it("should return user by id", () => {
      return pactum
        .spec()
        .get('/users/{userId}')
        .withPathParams("userId", `$S{userId}`)
        .expectStatus(200)
        .expectJsonLike(
          {
            success: true,
            user: {
              id: `$S{userId}`
            }
        })

    });


    it("should throw error user not found", () => {
      return pactum
        .spec()
        .get('/users/{userId}')
        .withPathParams("userId", 9999)
        .expectStatus(404)
        .expectJsonLike(
          {
            success: false,
            message: "User not found"
          })

    });


    it("should throw error userID validation failed", () => {
      return pactum
        .spec()
        .get('/users/{userId}')
        .withPathParams("userId", "first")
        .expectStatus(422)
        .expectJsonLike(
          {
            success: false,
            message: "Validation failed",
            fails: {
              userId: [
                "The user must be an integer."
              ]
            }
          })

    });


  });

});
