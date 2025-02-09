export default async function evaluate(stockfishInstance, config) {
    const depth = 40

    await stockfishInstance.setConfig(config)
    return await stockfishInstance.go(depth)
}
