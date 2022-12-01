var fs = require("fs")

class FilteredData {

  constructor(inputFiles, excludeFile) {
    this.inputFiles = inputFiles;
    this.excludeFile = excludeFile
  }

  excludedWords() {
    return fs.readFileSync(this.excludeFile, { encoding: 'utf8', flag: 'r' }).toString('UTF8').split('\n')
  }

  inputFileStr(fileName) {
    let str = fs.readFileSync(fileName, { encoding: 'utf8', flag: 'r' })
      .toString('UTF8')
      .toLowerCase()
      .replaceAll(/[`~!@#$%^&*()_|+\-=?;:",.<>\{\}\[\]\\\/0-9]/g, '\n')
    return str
  }

  removeExcludeFileWords(str, arr) {
    let res = str.replace(new RegExp(`\\b(${arr.join("|")})\\b`, "g"), "")
    return res
  }

  sortedObject(obj) {

    var keys = Object.keys(obj).sort(function keyOrder(k1, k2) {
      if (k1 < k2) return -1;
      else if (k1 > k2) return +1;
      else return 0;
    });

    var i, after = {};
    for (i = 0; i < keys.length; i++) {
      after[keys[i]] = obj[keys[i]];
      delete obj[keys[i]];
    }

    for (i = 0; i < keys.length; i++) {
      obj[keys[i]] = after[keys[i]];
    }
    return obj;
  }


  WriteFile(object) {
    let payload = JSON.stringify(object, null, 2);
    fs.writeFile('index.txt', `${payload}`, 'utf-8', err => {
      if (err) { console.error(err) }
    });
  }

  output() {
    var object = {};
    for (let k = 0; k < this.inputFiles.length; k++) {
      let arr = this.removeExcludeFileWords(this.inputFileStr(this.inputFiles[k]), this.excludedWords())
        .replace(/(\r\n|\n|\r)/gm, " ")
        .split(' ')

      function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
      }
      let unique = arr.filter(onlyUnique);

      for (let i = 0; i < unique.length; i++) {
        if (unique[i]) {
          if ((unique[i] in object)) {
            object[unique[i]] = object[unique[i]] + ',' + parseInt(k + 1);
          }
          else object[unique[i]] = k + 1;
        }
      }
      // console.log(object);


    }
    let data = this.sortedObject(object)
    console.log(data);
    this.WriteFile(data)
  }

}

let indexFile = new FilteredData(['Page1.txt', 'Page2.txt', 'Page3.txt'], 'exclude-words.txt');
(indexFile.output())