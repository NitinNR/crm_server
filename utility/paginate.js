const pagination = ({ total, page, per_page }, callback) => {
    offset = (page - 1) * per_page + 1
    let prev_page = Math.abs(page - 1)
    let current_page = parseInt(page)
    if (offset === 1) { prev_page = null; current_page = 1 }
    let next_page = Math.abs(parseInt(page) + 1)
    let last_page = Math.ceil(total / per_page)
    if (current_page === last_page) { next_page = null; last_page = null }
    if (total < per_page) { next_page = null; last_page = null }

    callback({
        prev_page,
        current_page,
        next_page,
        last_page
    })
}

const paginate = ({page,pageSize})=>{
    page = Math.abs(parseInt(page))
    let page_size = Math.abs(parseInt(pageSize))
    let offset = 0
    if (page === 0) {
        offset = 0
    } else {
        offset = Math.abs((page) * page_size)
    }
    return {page_size,offset}
}
module.exports = {pagination,paginate}