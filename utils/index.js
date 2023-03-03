const { v4: uuidv4 } = require('uuid');
const moment = require("moment")
const fs = require('fs')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
var ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);



const formatandoNumero = (number) => {

    let numeroFormatado = number
    if (number.length === 12 && number.startsWith('55')) {
        numeroFormatado = number.slice(0, 4) + "9" + number.slice(4);
    }

    return numeroFormatado
}

const adicionaDdi = (number) => {
    let numeroFormatado = ''
    if (number.substring(0, 2) === '55' || number.length >= 12) {
        numeroFormatado = number
    } else {
        numeroFormatado = '55' + number
    }

    return numeroFormatado
}

const geradorDeSenha = () => {
    var chars = "0123456789";
    var passwordLength = 6;
    var passwordNew = "";

    for (var i = 0; i < passwordLength; i++) {
        var randomNumber = Math.floor(Math.random() * chars.length);
        passwordNew += chars.substring(randomNumber, randomNumber + 1);
    }

    return passwordNew
}

const formataLista = (list) => {
    const obj = { admin: 0, fila: [] }

    obj.admin = list[0]?.admin

    list.map(item => {
        obj.fila.push({ fila: item.fila_id, supervisor: item.supervisor })
    })

    return obj
}

const removeSpecialCharacter = (especialChar) => {
    especialChar = especialChar.replace(/[áàãâä]/gi, 'a');
    especialChar = especialChar.replace(/[éèêë]/gi, 'e');
    especialChar = especialChar.replace(/[íìîï]/gi, 'i');
    especialChar = especialChar.replace(/[óòõôö]/gi, 'o');
    especialChar = especialChar.replace(/[úùûü]/gi, 'u');
    especialChar = especialChar.replace(/[ç]/gi, 'c');
    especialChar = especialChar.replace(/[']/gi, '');
    especialChar = especialChar.replace(/[^a-zA-Z0-9\s/-]/gi, '');
    return especialChar;
}

const removeEmoji = (str) => {
    const formattedStr = str.replace(/[^a-zA-Z0-9áàãâäéèêëíìîïóòõôöúùûüçÁÀÃÂÄÉÈÊËÍÌÎÏÓÒÕÔÖÚÙÛÜÇ,\.'"“\[\]\}\{\\\|\/!@#$%\^&\*\(\)~`?<>;:+=_…\s\t-]/gi, '');
    return formattedStr;
}

const base64MimeType = (encoded) => {
    var result = null;

    if (typeof encoded !== 'string') {
        return result;
    }

    var mime = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);

    if (mime && mime.length) {
        result = mime[1];
    }

    return result;
}

const handleFileName = ({ filename, mimetype }) => {
    if (filename) {
        const extension = filename.match(/[^\.]+$/)[0]
        const name = removeAccents(filename.replace(/(^.*)(\..+$)/, '$1').replace(/\s/g, '_').toUpperCase())

        return `${name}.${extension}`
    } else {
        switch (mimetype?.replace(/;.*$/g, '')) {
            case 'audio/mpeg':
                return `audio_${moment().utcOffset(-3).format('DD-MM-YYYY_HH-mm-ss')}.mp3`
            case 'audio/ogg':
                return `audio_${moment().utcOffset(-3).format('DD-MM-YYYY_HH-mm-ss')}.ogg`
            case 'audio/mp4':
                return `audio_${moment().utcOffset(-3).format('DD-MM-YYYY_HH-mm-ss')}.mp4`
            case 'video/mp4':
                return `video_${moment().utcOffset(-3).format('DD-MM-YYYY_HH-mm-ss')}.mp4`
            case 'image/jpeg':
                return `imagem_${moment().utcOffset(-3).format('DD-MM-YYYY_HH-mm-ss')}.jpeg`
            case 'image/png':
                return `imagem_${moment().utcOffset(-3).format('DD-MM-YYYY_HH-mm-ss')}.png`
            default:
                return uuidv4()
        }
    }
}

const delay = async (seconds) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, 1000 * seconds);
    })
}

const removeAccents = (str) => {
    return str.normalize("NFD").replace(/\p{Diacritic}/gu, "")
}

const convertBase64ToFile = async (base64, filename) => {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(global.__basedir + '/tmp/')) {
            fs.mkdirSync(global.__basedir + '/tmp/');
        }

        fs.writeFileSync(`${global.__basedir}/tmp/${filename}`, Buffer.from(base64, 'base64'));
        resolve()
    })
}

const encodeAudioFileToMp3 = async (filename) => {
    return new Promise((resolve, reject) => {
        try {

            ffmpeg(fs.createReadStream(`${global.__basedir}/tmp/${filename}`))
                .output(`${global.__basedir}/tmp/${filename.match(/.*(?=\.)/)[0]}.opus`)
                .audioCodec('libopus')
                .on('end', () => resolve())
                .run();
        } catch (error) {
            console.error('Erro encodeAudioFileToMp3', error)

            reject(error)
        }
    })
}

const deleteTemporaryFiles = async (filename) => {
    return new Promise((resolve, reject) => {
        fs.unlinkSync(`${global.__basedir}/tmp/${filename}`)
        fs.unlinkSync(`${global.__basedir}/tmp/${filename.match(/.*(?=\.)/)[0]}.opus`)

        fs.readdir(`${global.__basedir}/tmp/`, (err, files) => {
            if (!files.length) {
                fs.rmdir(`${global.__basedir}/tmp/`, (err) => {
                    resolve()
                })
            } else {
                resolve()
            }
        });
    })
}

const timestampToDatetime = (timestamp) => {
    if (!timestamp) return moment().utcOffset(-3).format('YYYY-MM-DD HH:mm:ss')
    
    try {
        return moment(new Date(timestamp * 1000)).format('YYYY-MM-DD HH:mm:ss')
    } catch (error) {
        return moment().utcOffset(-3).format('YYYY-MM-DD HH:mm:ss')
    }
}

module.exports = {
    formatandoNumero,
    adicionaDdi,
    geradorDeSenha,
    formataLista,
    handleFileName,
    base64MimeType,
    delay,
    removeAccents,
    removeEmoji,
    convertBase64ToFile,
    encodeAudioFileToMp3,
    deleteTemporaryFiles,
    timestampToDatetime,
    removeSpecialCharacter
}