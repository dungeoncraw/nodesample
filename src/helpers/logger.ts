export const logger = (data: object) => {
    const body = JSON.stringify(data);
    console.log(body);
}