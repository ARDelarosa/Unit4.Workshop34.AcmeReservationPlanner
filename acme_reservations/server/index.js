const express = require ('express');
const app = express()
const {
    client,
    createTables,
    createCustomer,
    createRestaurant,
    createReservation,
    destroyReservation,
    fetchCustomers,
    fetchRestaurants,
    fetchReservations
    } = require ('./db');
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(require('morgan')('dev'));

//get customers
app.get('/api/customers', async (req, res, next)=>{
    try {
        res.send(await fetchCustomers())
    } catch (error) {
        next(error)
    }
})
//get restaurants
app.get('/api/restaurants', async (req, res, next)=>{
    try {
        res.send(await fetchRestaurants())
    } catch (error) {
        next(error)
    }
})
//post new reservation
app.post('/api/customers/:customer_id/reservations', async (req, res, next)=>{
    try {
        const customer_id = req.params.customer_id
        const restaurant_id = req.body.restaurant_id
        const date = req.body.date
        res.send(await createReservation(customer_id, restaurant_id, date))
    } catch (error) {
        next(error)
    }
})
//delete reservation
app.delete('/api/customers/:customer_id/reservations', async (req, res, next)=>{
    try {
        const customerID = req.params.customer_id
        const id = req.params.id
        await destroyReservation(id, customerID) && res.sendStatus(204)
    } catch (error) {
        next(error)
    }
})

// This is our server express
// Where are SQL is created
const init = async()=>{
    await client.connect();
    console.log('connected to the database');
    await createTables();
    console.log("Tables have been created");

    await Promise.all([
        createRestaurant("Sorentos"),
        createRestaurant("Cowboy Star"),
        createRestaurant("Steamy Piggy"),
        createCustomer("David Smith"),
        createCustomer("Amy Jones"),
        createCustomer("Ken Wilson")]);
    const customers = await fetchCustomers()
    const restaurants = await fetchRestaurants()
    console.log("customers seeded and they are :", customers, "restaurants seeded and they are :", restaurants);

    await createReservation(
        customers[2].id,
        restaurants[0].id,
        '2024-12-25',
        4
    );
    const reservations = await fetchReservations();

    //await destroyReservation([0].id, users[2].id);
    //const newReservations = await fetchReservations();
    console.log("and reservations too!:", reservations);
    console.log("the data was seeded!")

    app.listen(port, () => {
        console.log(`listening on port ${port}`);
    });
}

init();