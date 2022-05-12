export default async function fetchData(){
    try {
            const { results } = await (await fetch(`https://api.unsplash.com/search/photos?query=cat&per_page=8`,{
            'headers': {
                'Authorization': 'Client-ID lIV6jJtWjU9DpjJtArWjWMhVa2IH7OC7ywvcCjjwlUo'
            }
        })).json();
        return results;
    } catch (e){
        console.warn(e);
        return e
    }
}

