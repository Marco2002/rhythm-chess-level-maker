export default async function evaluate(stockfishInstance, config) {
    const depth = 50
    await stockfishInstance.setConfig(config)
    return await stockfishInstance.go(depth)
}
