describe('Basic user flow for Website', () => {
  beforeAll(async () => {
    await page.goto('https://cse110-sp25.github.io/CSE110-Shop/');
  });

  it('Initial Home Page - Check for 20 product items', async () => {
    const numProducts = await page.$$eval('product-item', prodItems => prodItems.length);
    expect(numProducts).toBe(20);
  });

  it('Make sure <product-item> elements are populated', async () => {
    const prodItems = await page.$$('product-item');
    let allArePopulated = true;
    for (let i = 0; i < prodItems.length; i++) {
      const data = await page.evaluate(item => item.data, prodItems[i]);
      const { title, price, image } = data;
      if (!title || !price || !image) {
        allArePopulated = false;
        break;
      }
    }
    expect(allArePopulated).toBe(true);
  });

  it('Clicking the "Add to Cart" button should change button text', async () => {
    const prodItem = await page.$('product-item');
    const shadowRoot = await prodItem.getProperty('shadowRoot');
    const button = await shadowRoot.$('button');
    await button.click();
    const innerText = await (await button.getProperty('innerText')).jsonValue();
    expect(innerText).toBe('Remove from Cart');
  });

  it('Checking number of items in cart on screen', async () => {
    await page.$$eval('product-item', items => {
      items.forEach(item => {
        const btn = item.shadowRoot.querySelector('button');
        if (btn && btn.innerText === 'Add to Cart') btn.click();
      });
    });
    const count = await page.$eval('#cart-count', el => el.innerText);
    expect(count).toBe('20');
  }, 30000);

  it('Checking number of items in cart on screen after reload', async () => {
    await page.reload();
    await page.waitForSelector('product-item');
    const texts = await page.$$eval('product-item', items =>
      items.map(item => item.shadowRoot.querySelector('button').innerText)
    );
    texts.forEach(text => expect(text).toBe('Remove from Cart'));
    const count = await page.$eval('#cart-count', el => el.innerText);
    expect(count).toBe('20');
  }, 20000);

  it('Checking the localStorage to make sure cart is correct', async () => {
    const cart = await page.evaluate(() => localStorage.getItem('cart'));
    expect(cart).toBe(JSON.stringify(Array.from({length:20}, (_, i) => i+1)));
  });

  it('Checking number of items in cart on screen after removing from cart', async () => {
    await page.$$eval('product-item', items => {
      items.forEach(item => {
        const btn = item.shadowRoot.querySelector('button');
        if (btn && btn.innerText === 'Remove from Cart') btn.click();
      });
    });
    const count = await page.$eval('#cart-count', el => el.innerText);
    expect(count).toBe('0');
  }, 30000);

  it('Checking number of items in cart on screen after reload', async () => {
    await page.reload();
    await page.waitForSelector('product-item');
    const texts = await page.$$eval('product-item', items =>
      items.map(item => item.shadowRoot.querySelector('button').innerText)
    );
    texts.forEach(text => expect(text).toBe('Add to Cart'));
    const count = await page.$eval('#cart-count', el => el.innerText);
    expect(count).toBe('0');
  }, 20000);

  it('Checking the localStorage to make sure cart is correct', async () => {
    const cart = await page.evaluate(() => localStorage.getItem('cart'));
    expect(cart).toBe('[]');
  });
});