import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import tinify from "tinify";
import { FileSystemStoredFile } from "nestjs-form-data";
import * as fs from "fs";
import { join } from "path";
import * as sharp from "sharp";

@Injectable()
export class ImageProcessingService {
  constructor(private config: ConfigService) {
    tinify.key = this.config.get("TINIFY_KEY")
  }

  async processImage(image: FileSystemStoredFile){
    const imageBuffer = fs.readFileSync(image.path)

    const imageName = `${Date.now()}.jpg`

    const outputPath = join(process.cwd(),'images', `${imageName}`);

    const resizedBuffer = await sharp(imageBuffer)
      .resize(70, 70, {
        fit: 'cover',
        position: 'center'
      }).toBuffer()

    const optimizedBuffer = await tinify.fromBuffer(resizedBuffer).toBuffer();

    fs.writeFileSync(outputPath, optimizedBuffer);

    return `images/${imageName}`;
  }
}
