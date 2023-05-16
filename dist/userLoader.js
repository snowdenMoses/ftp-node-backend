"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userDataloader = void 0;
const dataloader_1 = __importDefault(require("dataloader"));
const server_1 = require("./server");
const vendors = ;
exports.userDataloader = new dataloader_1.default((ids) => {
    const userMap = server_1.prisma;
});
