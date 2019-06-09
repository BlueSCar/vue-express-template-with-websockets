module.exports = async (channel, io) => {
    const createQueue = async (exchangeName, action) => {
        channel.assertExchange(exchangeName, 'fanout');

        let q = await channel.assertQueue('', {
            exclusive: true
        });

        channel.bindQueue(q.queue, exchangeName, '');

        channel.consume(q.queue, (message) => {
            if (message.content) {
                action(JSON.parse(message.content.toString()));
            }
        }, {
            noAck: true
        });
    };

    // await createQueue('queue_name', (content) => {
    //     // do stuff
    // });
};
