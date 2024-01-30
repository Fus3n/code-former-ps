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


module.exports = {
    getValue
};