export default async function evaluate(stockfishInstance, config) {
    const depth = 25

    await stockfishInstance.setConfig(config)
    return await stockfishInstance.go(depth)
}
