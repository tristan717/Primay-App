"use client";
import { useEffect, useState } from 'react';
import AxiosInstance from '../../utils/axios.js';

const Home = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        AxiosInstance.get('/data')
            .then(response => {
                setData(response.data);
            })
            .catch(error => {
                setError(error.message);
            });
    }, []);

    if (error) return <div>Error: {error}</div>;
    if (!data) return <div>Loading...</div>;

    return (
        <div>
            <h1>Data from API</h1>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
};

export default Home;