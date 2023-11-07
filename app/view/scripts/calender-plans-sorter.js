const sort = async plans => {
    if (plans.length === 0) {
        return plans
    }

    const byDay = await byDay(plans)
    const byGroupId = await byGroupId(plans)

    // 先为所有计划设置默认排序
    plans.forEach((p) => p.sort = -1)

    for (const [date, list] of Object.entries(byDay)) {
        for (const plan of list) {
            if (plan.sort === null) {
                plan.sort = -1
            }
            // 排序如果不为 -1,相当于该计划已经被安排好排序了，则跳过
            if (plan.sort > -1) {
                continue
            }
            // 遍历当天中所有的计划
            const targetSort = list.findIndex((p) => p.sort === undefined && p.id > 0)
            if (targetSort !== -1) {
                continue
            }
            // 否则将该计划以及计划所在组的所有计划都设置为该排序
            const groupPlans = byGroupId[plan.groupId]
            for (const groupPlan of groupPlans) {
                groupPlan.sort = targetSort
            }
        }

        // 在空位置设置占位对象
        for (let i = list.reduce((max, plan) => Math.max(max, plan.sort), 0); i < list.length; i += 1) {
            const targetSort = i
            const targetPlan = plans.find((p) => p.sort === targetSort)
            if (!targetPlan) {
                plans.push(getHolderPlan(date, targetSort))
            }
        }
    }

    return plans
}

module.exports = sort
