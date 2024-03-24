const getValue = async (key) => {
    try {
        value = await require('uxp').storage.secureStorage.getItem(key); 
        value = String.fromCharCode.apply(null, value);
        return value;
    } catch (err) {
        console.error(err)
        return null;
    }
}

async function customPrompt(title, message, defaultValue = '') {
    let result = '';
    const main = document.createElement('dialog');
    main.innerHTML = `
        <form method="dialog" style="min-width: 300px; width: 100%;">
            <sp-heading>${title}</sp-heading>
            <hr>
            <p style="color: white">${message}</p>
            <input type="text" id="userInput" value="${defaultValue}" style="width: 100%;" />
            <footer>
                <button id="cancel">Cancel</button>
                <button type="submit" id="ok" uxp-variant="cta">OK</button>
            </footer>
        </form>
    `;

    document.body.appendChild(main);

    const [form, cancel, ok, userInput] = [
        main.querySelector('form'),
        main.querySelector('#cancel'),
        main.querySelector('#ok'),
        main.querySelector('#userInput')
    ];

    cancel.addEventListener('click', () => {
        result = null;
        main.close();
    });

    form.onsubmit = () => {
        result = userInput.value;
        main.close();
    };

    await main.uxpShowModal();
    main.remove();
    return result;
}

async function customAlert(message) {
    const alertDlg = document.createElement('dialog');
    alertDlg.innerHTML = `
        <form method="dialog">
            <sp-heading>CodeFormerPS</sp-heading>
            <hr>
            <sp-detail>${message}<sp-detail>
            <footer>
                <button id="ok" type="submit" uxp-variant="cta">OK</button>
            </footer>
        </form>
    `;

    document.body.appendChild(alertDlg);

    const okButton = alertDlg.querySelector('#ok');
    okButton.onclick = () => alertDlg.close();

    await alertDlg.uxpShowModal();
    alertDlg.remove();
}

async function showAbout() {
    const alertDlg = document.createElement('dialog');
    alertDlg.innerHTML = `
        <form method="dialog" style="padding: 0; margin: 0;">
            <sp-heading>CodeFormerPS</sp-heading>
            <sp-detail>Socials<sp-detail>
            <sp-link href="https://twitter.com/fus3_n" id="twitter-link">Twitter</sp-link>
            <sp-link href="https://github.com/Fus3n/" id="github-link">Github</sp-link>
            <sp-link href="https://www.youtube.com/@FlinCode" id="github-link">YouTube</sp-link>
            <footer>
                <button id="ok" type="submit" uxp-variant="cta">OK</button>
            </footer>
        </form>
    `;
  
    document.body.appendChild(alertDlg);
    const okButton = alertDlg.querySelector('#ok');
    okButton.onclick = () => alertDlg.close();
  
    await alertDlg.uxpShowModal();
    alertDlg.remove();
  }
  


module.exports = {
    getValue,
    customPrompt,
    customAlert,
    showAbout
};