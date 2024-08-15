const pg = require('pg');
const client = new pg.Client(
    process.env.DATABASE_URL || 'postgres://postgres:Viper001@localhost:5432/acme_reservation_planner');
const uuid = require('uuid');

// this is our server database
// Parents tables are customers and restaurants; child table is reservations
const createTables = async ()=>{
    const SQL =`
    DROP TABLE IF EXISTS reservations CASCADE;
    DROP TABLE IF EXISTS customers CASCADE;
    DROP TABLE IF EXISTS restaurants CASCADE;
    CREATE TABLE customers(
    id UUID PRIMARY KEY NOT NULL,
    name VARCHAR(50) NOT NULL
    );
    CREATE TABLE restaurants(
    id UUID PRIMARY KEY NOT NULL,
    name VARCHAR(50) NOT NULL
    );
    CREATE TABLE reservations(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) NOT NULL,
    restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
    date DATE NOT NULL,
    party_count INTEGER NOT NULL
    );
    `
    await client.query(SQL);
    console.log('tables created');
};

 const createCustomer = async (customerName)=>{
    const SQL = `
    INSERT INTO customers(id, name) 
    VALUES($1, $2)
    RETURNING *;
    `
    const response = await client.query(SQL, [uuid.v4(), customerName]);
    return response.rows[0];
}

const createRestaurant = async (restaurantName)=>{
    const SQL = `
    INSERT INTO restaurants(id, name) 
    VALUES($1, $2)
    RETURNING *;
    `
    const response = await client.query(SQL, [uuid.v4(), restaurantName]);
    return response.rows[0];
}

const createReservation = async (customer_id, restaurant_id, date, party_count)=>{
    const SQL = `
    INSERT INTO reservations(customer_id, restaurant_id, date, party_count) 
    VALUES($1, $2, $3, $4)
    RETURNING *;
    `
    const response = await client.query(SQL, [customer_id, restaurant_id, date, party_count]);
    return response.rows[0];
}

const destroyReservation = async (id, customer_id)=>{
    const SQL = `
    DELETE FROM reservations
    WHERE id = $1 AND customer_id = $2;
    `
    await client.query(SQL, [id, customer_id]);
    return 'deleted';
}


const fetchCustomers = async ()=>{
    const SQL = `
    SELECT *
    FROM customers;
    `
    const response = await client.query(SQL);
    return response.rows;
}

const fetchRestaurants = async ()=>{
    const SQL = `
    SELECT *
    FROM restaurants;
    `
    const response = await client.query(SQL);
    return response.rows;
}

const fetchReservations = async ()=>{
    const SQL = `
    SELECT *
    FROM reservations;
    `
    const response = await client.query(SQL);
    return response.rows;
}


module.exports = {
    client,
    createTables,
    createCustomer,
    createRestaurant,
    createReservation,
    destroyReservation,
    fetchCustomers,
    fetchRestaurants,
    fetchReservations
};