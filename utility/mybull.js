// const { Queue,Worker } = require("bullmq");
const IORedis = require('ioredis');
const connection = new IORedis();
const { sendMessage, sendMessage2 } = require("./whatsappscript")

const { Worker, Queue, QueueScheduler } = require('bullmq');

class Mybull {
  constructor(queueName) {
    this.queue_name = queueName;
    this.queue = new Queue(queueName, {
      connection: {
        host: "localhost",
        port: 6379
      }
    });
    this.worker = new Worker(queueName, this.processJob.bind(this), {
      connection: {
        host: "localhost",
        port: 6379
      },
    });
    // this.queueScheduler = new QueueScheduler(queueName, { connection });

    this.worker.on('completed', (job) => {
      console.log(`Job ${job.id} completed`);
    });
  }

  async processJob(job) {
    try {
      console.log(`Processing job ${job.id}: ${JSON.stringify(job.data)}`);
      job = job.data;
      const data = {
        messaging_product: "whatsapp",
        to: job.contact.whatsapp_number,
        type: "template",
        template: {
          name: job.template_name,
          language: { code: job.template_code }
        }
      };
      console.log("data:",data);
      sendMessage2(job.creds.phone_number_id, job.creds.access_token, data)
      // here need start work i.e create seperate function to accept single contact and send the msg
    } catch (error) {
      console.error(`Error processing job ${job.id}: ${error.message}`);
      job.retry(); // Retry the job on error
    }
  }

  async addJob(data, options = {}) {
    const job = await this.queue.add(this.queue_name, data, options);
    console.log(`Job ${job.id} added to the queue`);
  }

  start() {
    // this.worker.run();
    console.log('MyBull started');
  }

  async close() {
    await this.worker.close();
    await this.queueScheduler.close();
    console.log('BullMQWrapper closed');
  }
}

// Example usage:
// const wrapper = new BullMQWrapper('exampleQueue', 'redis://localhost:6379');
// wrapper.start();

// Adding a job with a delay
// wrapper.addJob({ message: 'Hello, BullMQ!' }, { delay: 1000 }); // Delayed by 5 seconds

module.exports = Mybull;