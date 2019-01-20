
module.exports = (app) => {

  const {Dna} = app.models;

  const dnaComponent = {

    checkDna(req, res, next) {
      if(req.body && req.body.dna) {
        let isMutant = dnaComponent.checkMutant(req.body.dna);

        //Verificando se DNA existe na base
        Dna.find({dna: req.body.dna}, (err, foundDna) => {
          if(err) res.send(400);

          if(foundDna.length === 0) {
            //Salvando DNA não existente na base
            const dna = new Dna({ dna: req.body.dna, type: isMutant? 'mutant':'human' });
            dna.save().then(() => {
              dnaComponent.sendResponse(res, isMutant);
            });
          } else {
            dnaComponent.sendResponse(res, isMutant);
          }
        })
      } else {
        res.status(400);
        res.json({"message": "DNA not informed!"});
      }
    },

    //Logica de verificação se é mutante ou não
    checkMutant(dna) {
      let isMutant = false;
      let columnLength = dna.length;
      let lineLength = dna[0].length;
      let diagonalMaxLength = columnLength > lineLength? lineLength:columnLength;
      let findSequenceHorizontal = false, findSequenceVertical = false, findSequenceDiagonal = false;

      if(columnLength < 4 || lineLength < 4) {
        return false;
      }

      dna.forEach((dnaSequence, index) => {
        //console.log(dnaSequence, 'sequence')
        //console.log('VERIFICANDO LINHA')

        let lastLetter = '' , sequenceCount = 0;
        for(let index = 0; index < dnaSequence.length; index++) {
          //console.log(dnaSequence[index]);

          //VERIFICANDO LINHA
          if(!findSequenceHorizontal) {
            let checkedValues = dnaComponent.checkLetterSequence(lastLetter, sequenceCount, dnaSequence[index]);
            lastLetter = checkedValues[0], sequenceCount = checkedValues[1], findSequenceHorizontal = checkedValues[2];
          }

          //VERIFICANDO COLUNA
          if(!findSequenceVertical) {
            findSequenceVertical = dnaComponent.checkDnaColumn(dna, index, columnLength);
          }

          //VERIFICANDO DIAGONAIS
          if(!findSequenceDiagonal) {
            findSequenceDiagonal = dnaComponent.checkDnaDiagonal(dna, index, diagonalMaxLength);
          }

        }
        //console.log('FIM VERIFICACAO LINHA')
      });

      //console.log(findSequenceHorizontal, findSequenceVertical, findSequenceDiagonal, 'checks')

      if(findSequenceHorizontal && findSequenceVertical && findSequenceDiagonal) {
        isMutant = true;
      }

      return isMutant;
    },

    checkDnaDiagonal(dna, lineIndex, diagonalMaxLength) {
      let diagonalLength = diagonalMaxLength - (lineIndex);

      let lastLetterDiagonal1 = '', sequenceCountDiagonal1 = 0;
      let lastLetterDiagonal2 = '', sequenceCountDiagonal2 = 0;
      if(diagonalLength >= 4) {
        //console.log('VERIFICANDO DIAGONAL LINHA')
        for(let index=0; index < diagonalLength;index++) {
          //console.log(dna[index + lineIndex][index]);
          let checkedValues = dnaComponent.checkLetterSequence(
            lastLetterDiagonal1, sequenceCountDiagonal1, dna[index + lineIndex][index]);

          if(checkedValues[2] === true) {
            return true
          }
          lastLetterDiagonal1 = checkedValues[0], sequenceCountDiagonal1 = checkedValues[1];

          if(lineIndex !== 0) {
            //console.log(dna[index][index + lineIndex]);
            let checkedValues = dnaComponent.checkLetterSequence(
              lastLetterDiagonal2, sequenceCountDiagonal2, dna[index + lineIndex][index]);

            if(checkedValues[2] === true) {
              return true
            }
            lastLetterDiagonal2 = checkedValues[0], sequenceCountDiagonal2 = checkedValues[1];
          }

        }
        //console.log('FIM VERIFICACAO DIAGONAL LINHA')
      } else {
        return false;
      }

    },

    checkDnaColumn(dna, columnIndex, columnLength) {
      //console.log('PERCORRENDO COLUNA')

      let lastLetter = '', sequenceCount = 0;
      for(let index=0; index < columnLength; index++) {
        //console.log(dna[index][columnIndex])
        let checkedValues = dnaComponent.checkLetterSequence(lastLetter, sequenceCount, dna[index][columnIndex]);
        if(checkedValues[2] === true) {
          return true
        }

        lastLetter = checkedValues[0], sequenceCount = checkedValues[1];
      }

      return false;
      //console.log('FIM DA COLUNA')
    },

    checkLetterSequence(lastLetter, sequenceCount, letter) {
      if(!lastLetter) {
        lastLetter = letter;
        sequenceCount++;
      } else if(lastLetter === letter) {
        sequenceCount++;
        if(sequenceCount === 4) {
          return [lastLetter, sequenceCount, true]
        }
      } else {
        lastLetter = letter;
        sequenceCount=1;
      }

      return [lastLetter, sequenceCount, false];
    },

    sendResponse(res, isMutant) {
      if(isMutant) {
        res.send(200);
      } else {
        res.send(403);
      }
    },

    checkStats(req, res, next) {
     let totalDnas = 0, mutantDnas = 0, humanDnas = 0, ratio = 0;

       dnaComponent.countDna({type: 'mutant'})
         .then(count => {
           mutantDnas = count;
           return dnaComponent.countDna({type: 'human'})
         })
         .then(count => {
           humanDnas = count;
           return dnaComponent.countDna({});
         }).then(totalDnas =>
           res.json(
             {"ADN":
                {
                  "count_mutant_dna": mutantDnas,
                  "count_human_dna": humanDnas,
                  "ratio": dnaComponent.checkRatio(totalDnas, mutantDnas)
                }
              }
           )
         );

     next();
   },

   countDna(filter) {
     return Dna.countDocuments(filter, (err, count) => {
       if(err) res.send(500);
       return count;
     });
   },

   checkRatio(totalValue, valueToDiscoverPercentage) {
     return valueToDiscoverPercentage / totalValue;
   }

  }

  return dnaComponent;
}
