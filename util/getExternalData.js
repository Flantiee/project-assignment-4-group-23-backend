const axios = require('axios');

const options = {
    method: 'GET',
    url: 'https://real-time-product-search.p.rapidapi.com/store-reviews',
    params: {
        store_domain: 'amazon.com',
        limit: '4',
        rating: 'ALL',
        sort_by: 'MOST_HELPFUL',
        time_frame: 'ALL',
        country: 'us',
        language: 'en'
    },
    headers: {
        'x-rapidapi-key': '3c67ff8928msh0e0b628614edcb7p1e40fajsn68ef92736436',
        'x-rapidapi-host': 'real-time-product-search.p.rapidapi.com'
    }
};


const fetchBrandReviews = async (store) => {
    try {
        options.params.store_domain = store + '.com';
        const response = await axios.request(options);
        return response.data
    } catch (error) {
        console.error(error);
    }
}
module.exports = fetchBrandReviews