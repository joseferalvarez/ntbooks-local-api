import http from "http";
import { Client } from "@notionhq/client";

const host = "localhost";
const port = 8000;

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");
  
  switch (req.url){
    case "/":
      if(req.method === 'POST'){
        let body = '';

        req.on('data', (data) => {
          body += data;
        });
        req.on('end', () => {
          saveNotionBook(JSON.parse(body));
        });
      }
      res.writeHead(200);
      res.end(JSON.stringify({data: "success"}));
      break;
    default:
      res.writeHead(404);
      res.end(JSON.stringify({error: "Not Found"}));
  };
});

server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});


const saveNotionBook = async (book: any) => {
  const notion = new Client({auth: book.notion_token});

  const authors = book.authors.map((author: string) => {
    return {"name": author}
  });

  const publishers = book.publisher.map((publisher: string) => {
    return {"name": publisher}
  });

  const response = await notion.pages.create({
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
        title:[
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
}