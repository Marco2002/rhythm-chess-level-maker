const depth = 40

export default async function evaluate(stockfishInstance, config) {
    await stockfishInstance.setConfig(config)
    return await stockfishInstance.go(depth)
}
