const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');

const app = express();
const port = 3000;

let client; // Declare the client outside the routes
// Increase the request timeout to 30 seconds (30,000 milliseconds)
app.timeout = 60000;
// Middleware to parse JSON request bodies
app.use(express.json());


app.all('/', (req, res) => {
    console.log("Just got a request!")
    res.send('Yo!')
})



app.post('/', (req, res) => {
  let data = {"msg":"welcome to web whatsapp api."};
    res.json(data);

});

app.post('/sendmsg', (req, res) => {
   
    const data = req.body;
    
   client = new Client({
            authStrategy: new LocalAuth({
                clientId: data.clientid
            }),
            puppeteer: {
                headless: true,
                handleSIGINT: false,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox'
                ]
            }
        });

        client.on('qr', qr => {
            res.json({ qrCode: qr });
        });

        client.on('ready', async () => {

            data.all_msg.forEach(async element => {
                let resp =  await sendMessage(element.mobileno,element.msg);
            });
            
            setInterval(() => {
            client.destroy();
            }, 5000);
            res.json({ "client_ready": true ,"data":data});
        });

        // client.on('authenticated', () => {
        //     res.json({ "Client_authenticated": true }); 
        // });


        client.initialize();
      
 
});

async function sendMessage(varNumber,varMessage) 
{
    const number = varNumber;
    const sanitized_number = number.toString().replace(/[- )(]/g, ""); // remove unnecessary chars from the number
    const final_number = `91${sanitized_number.substring(sanitized_number.length - 10)}`; // add 91 before the number here 91 is country code of India
    
    const number_details = await client.getNumberId(final_number); // get mobile number details
    const sendData = {
        message : varMessage
    };
    let rdata = {};
    if (number_details) {
        const sendMessageData = await client.sendMessage(number_details._serialized, sendData.message); // send message
        rdata = {"sendMessageData":sendMessageData};
    } else {
        rdata = {"msg":"Mobile number is not registered"};
        console.log(final_number, "Mobile number is not registered");
    } 

    return rdata;
}

 

app.listen(process.env.PORT || 3000)