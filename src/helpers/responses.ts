type HttpResponse = {
    data?: object,
    message?: string
}
export const generateHttpResponse = (statusCode: number, data?: object, message?: string) => {
    const body: HttpResponse = { data, message }
    return {
        statusCode: statusCode ?? 400,
        body: JSON.stringify(body),
    };
}