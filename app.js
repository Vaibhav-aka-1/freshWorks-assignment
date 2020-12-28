const express = require('express');
const fs = require('fs');

const app = express();
app.use(express.json());

const saveUserData = (data) => {
    const stringifyData = JSON.stringify(data,null,2);
    fs.access("users.json", error => {
        if (!error) {
            fs.writeFileSync('users.json', stringifyData);
        } else {
            fs.appendFile('users.json', stringifyData, function (err) {
                if (err) throw err;
                console.log('Saved!');
              });
        }
    });
    
}

const getUserData = () => {
    if (fs.existsSync("users.json")) {
        const jsonData = fs.readFileSync('users.json');
        return JSON.parse(jsonData) ;
    }
    else{
        return null;
    }
}

app.post('/user/add', (req, res) => {
    const existUsers = getUserData();
    if(existUsers == null ){
        data = [];
        data.push(req.body);
        saveUserData(data);
        return res.send({success: true, msg: 'File does not exist, now its been created naming: users.json'})
    }
    
    const userData = req.body
    if (userData.key === null || userData.value === null) {
        return res.status(401).send({error: true, msg: 'key-value data missing'});
    }
    
    
    const findExist = existUsers.find( pair => pair.key === userData.key )
    if (findExist) {
        return res.status(409).send({error: true, msg: 'Key already exist'});
    }
    existUsers.push(userData);
    saveUserData(existUsers);
    res.send({success: true, msg: 'User data added successfully'});
})

app.get('/user/list', (req, res) => {
    const users = getUserData();
    res.send(users);
})


app.delete('/user/delete/:key', (req, res) => {
    const key = req.params.key
    const existUsers = getUserData();
    if(existUsers == null || typeof existUsers === "undefined"){
        return res.send({error: true, msg: 'File does not exist, plz create file first'});
    }
    const filterUser = existUsers.filter( user => user.key !== key );
    if ( existUsers.length === filterUser.length ) {
        return res.status(409).send({error: true, msg: 'key does not exist'});
    }

    saveUserData(filterUser);
    res.send({success: true, msg: 'key removed successfully'});
    
})

app.listen(3000, () => {
    console.log('Server runs on port 3000');
})