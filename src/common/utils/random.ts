import { Injectable } from "@nestjs/common";

@Injectable()
export class Random {
  text(rounds: number = 5) {
    let value: string = "";

    for (let i = 0; i < rounds; i++) {
      value += Math.random().toString(36).substring(2);
    }

    return value;
  }
}
