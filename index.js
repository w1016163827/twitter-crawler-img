const puppeteer = require('puppeteer');
const {writeFile} = require('fs')


module.exports = ({query,pages,headless=false,userName,password})=>{
    const url = `https://mobile.twitter.com/search?q=${query}&src=typd&f=image`
    ;(async()=>{
        //1.创建浏览器
        const browser = await puppeteer.launch({
            args: ['--no-sandbox'],
            headless
        });
        //2.新建标签也
        const page = await browser.newPage()
        //3.跳转到指定网站
        await page.goto(url)
        //4.等待网站加载完成，开始爬去数据
        //href="/login"
        await awaitPageFrist()
        //跳转登录界面
        await page.click('a[data-testid="login"]')
        console.log('登陆按钮点击完毕');
        await awaitPage()
        //登录环节
        await page.evaluate((userName,password)=>{
            let userNameInput = document.querySelectorAll("input[name='session[username_or_email]']")[0]
            let passwordInput = document.querySelectorAll("input[name='session[password]']")[0]
            let loginButton = document.querySelectorAll("div[tabindex='0']")[0]
            userNameInput.value = userName
            passwordInput.value = password
            loginButton.click()
        },userName,password)
        console.log('登录完毕');
        //图片爬取环节
        //图片数组
        let imgArr = []
        for (let i = 0; i < pages; i++) {
            //等待页面数据加载
            await awaitPage()
            //当前为止页面图片数据爬取
            let result = await page.evaluate(()=>{
                let res= []
                let imgs = document.querySelectorAll('img[alt="图像"]')
                for (let i = 0; i < imgs.length; i++) {
                    let img = imgs[i]
                    let imgSrc = img.src
                    imgSrc = imgSrc.substr(0,imgSrc.indexOf("?")) + ".png"
                    res.push(imgSrc)
                }
                let y = document.documentElement.scrollTop
                y+=1600
                window.scrollTo(0,y)
                return res
            },)
            //把当前页面图片数据添加到图片数组里
            imgArr = imgArr.concat(result)
            //移动到下一个页面位置
        }
        imgArr = [...new Set(imgArr)]
        imgArr = JSON.stringify(imgArr)
        writeFile('imgs',imgArr,(err)=>{
            if(!err){
                console.log('保存文件完成');
            }else {
                console.log('保存文件失败');
            }
        })
        //6.关闭浏览器
        await browser.close();
        // return result
    })()
}



function awaitPage() {
    return new Promise(resolve => {
        setTimeout(resolve,1000*6)
    })
}
function awaitPageFrist() {
    return new Promise(resolve => {
        setTimeout(resolve,1000*5)
    })
}