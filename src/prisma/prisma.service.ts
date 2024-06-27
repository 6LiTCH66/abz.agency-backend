import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import {ConfigService} from "@nestjs/config";
import { faker } from "@faker-js/faker";

@Injectable()
export class PrismaService extends PrismaClient{
  constructor(private config: ConfigService) {
    super({
      datasources:{
        db:{
          url: config.get('DATABASE_URL'),
        }
      }
    });
  }
  cleanDb(){
    return this.$transaction([
      this.position.deleteMany(),
      this.user.deleteMany(),
    ])
  }

  async seedDb() {

    const getPositions = async () => {
      const positions = await this.position.findMany({
        select: {
          id: true
        },
      });

      if (positions.length === 0) {
        return this.position.createManyAndReturn({
          data: [
            { name: "Lawyer" },
            { name: "Content manager" },
            { name: "Security" },
            { name: "Designer" }
          ],
        });
      }

      return positions;
    };

    const generateUser = (positions: number[]) => {
      return {
        email: faker.internet.email(),
        name: faker.name.firstName(),
        phone: faker.phone.number('380#########'),
        photo: `${this.config.get("BASE_URL")}/images/1718818593196.jpg`,
        position_id: faker.helpers.arrayElement(positions)
      };
    };

    const positions = await getPositions();
    const positionsArray = positions.map((obj) => obj.id);

    for (let i = 0; i < 45; i++) {
      await this.user.create({
        data: {
          ...generateUser(positionsArray)
        }
      });
    }
  }


}
