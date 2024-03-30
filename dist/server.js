var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import http from "http";
import { Client } from "@notionhq/client";
const host = "localhost";
const port = 8000;
const server = http.createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");
    switch (req.url) {
        case "/":
            if (req.method === 'POST') {
                let body = '';
                req.on('data', (data) => {
                    body += data;
                });
                req.on('end', () => {
                    saveNotionBook(JSON.parse(body));
                });
            }
            res.writeHead(200);
            res.end(JSON.stringify({ data: "success" }));
            break;
        default:
            res.writeHead(404);
            res.end(JSON.stringify({ error: "Not Found" }));
    }
    ;
});
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
const saveNotionBook = (book) => __awaiter(void 0, void 0, void 0, function* () {
    const notion = new Client({ auth: book.notion_token });
    const authors = book.authors.map((author) => {
        return { "name": author };
    });
    const publishers = book.publisher.map((publisher) => {
        return { "name": publisher };
    });
    const response = yield notion.pages.create({
        cover: {
            type: "external",
            external: {
                url: book.cover
            }
        },
        parent: {
            type: "database_id",
            database_id: book.notion_database
        },
        properties: {
            Name: {
                title: [
                    {
                        text: {
                            content: book.title
                        }
                    }
                ]
            },
            Author: {
                multi_select: authors.length > 4 ? authors.slice(0, 4) : authors
            },
            Publisher: {
                multi_select: [publishers[0]]
            },
            Language: {
                select: {
                    name: book.language ? book.language[0] : 'unknown',
                }
            },
            Pages: {
                number: book.pages,
            },
            Year: {
                number: book.published
            },
            URL: {
                url: book.url
            }
        }
    });
});
