function BranchData() {
    this.position = -1;
    this.nodeLength = -1;
    this.src = null;
    this.evalFalse = 0;
    this.evalTrue = 0;

    this.init = function(position, nodeLength, src) {
        this.position = position;
        this.nodeLength = nodeLength;
        this.src = src;
        return this;
    }

    this.ranCondition = function(result) {
        if (result)
            this.evalTrue++;
        else
            this.evalFalse++;
    };

    this.pathsCovered = function() {
        var paths = 0;
        if (this.evalTrue > 0)
          paths++;
        if (this.evalFalse > 0)
          paths++;
        return paths;
    };

    this.covered = function() {
        return this.evalTrue > 0 && this.evalFalse > 0;
    };

    this.toJSON = function() {
        return '{"position":' + this.position
            + ',"nodeLength":' + this.nodeLength
            + ',"src":' + jscoverage_quote(this.src)
            + ',"evalFalse":' + this.evalFalse
            + ',"evalTrue":' + this.evalTrue + '}';
    };

    this.message = function() {
        if (this.evalTrue === 0 && this.evalFalse === 0)
            return 'Condition never evaluated         :\t' + this.src;
        else if (this.evalTrue === 0)
            return 'Condition never evaluated to true :\t' + this.src;
        else if (this.evalFalse === 0)
            return 'Condition never evaluated to false:\t' + this.src;
        else
            return 'Condition covered';
    };
}

BranchData.fromJson = function(jsonString) {
    var json = eval('(' + jsonString + ')');
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

BranchData.fromJsonObject = function(json) {
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

function buildBranchMessage(conditions) {
    var message = 'The following was not covered:';
    for (var i = 0; i < conditions.length; i++) {
        if (conditions[i] !== undefined && conditions[i] !== null && !conditions[i].covered())
          message += '\n- '+ conditions[i].message();
    }
    return message;
};

function convertBranchDataConditionArrayToJSON(branchDataConditionArray) {
    var array = [];
    var length = branchDataConditionArray.length;
    for (var condition = 0; condition < length; condition++) {
        var branchDataObject = branchDataConditionArray[condition];
        if (branchDataObject === undefined || branchDataObject === null) {
            value = 'null';
        } else {
            value = branchDataObject.toJSON();
        }
        array.push(value);
    }
    return '[' + array.join(',') + ']';
}

function convertBranchDataLinesToJSON(branchData) {
    if (branchData === undefined) {
        return '{}'
    }
    var json = '';
    for (var line in branchData) {
        if (json !== '')
            json += ','
        json += '"' + line + '":' + convertBranchDataConditionArrayToJSON(branchData[line]);
    }
    return '{' + json + '}';
}

function convertBranchDataLinesFromJSON(jsonObject) {
    if (jsonObject === undefined) {
        return {};
    }
    for (var line in jsonObject) {
        var branchDataJSON = jsonObject[line];
        if (branchDataJSON !== null) {
            for (var conditionIndex = 0; conditionIndex < branchDataJSON.length; conditionIndex ++) {
                var condition = branchDataJSON[conditionIndex];
                if (condition !== null) {
                    branchDataJSON[conditionIndex] = BranchData.fromJsonObject(condition);
                }
            }
        }
    }
    return jsonObject;
}
function jscoverage_quote(s) {
    return '"' + s.replace(/[\u0000-\u001f"\\\u007f-\uffff]/g, function (c) {
        switch (c) {
            case '\b':
                return '\\b';
            case '\f':
                return '\\f';
            case '\n':
                return '\\n';
            case '\r':
                return '\\r';
            case '\t':
                return '\\t';
            // IE doesn't support this
            /*
             case '\v':
             return '\\v';
             */
            case '"':
                return '\\"';
            case '\\':
                return '\\\\';
            default:
                return '\\u' + jscoverage_pad(c.charCodeAt(0).toString(16));
        }
    }) + '"';
}

function getArrayJSON(coverage) {
    var array = [];
    if (coverage === undefined)
        return array;

    var length = coverage.length;
    for (var line = 0; line < length; line++) {
        var value = coverage[line];
        if (value === undefined || value === null) {
            value = 'null';
        }
        array.push(value);
    }
    return array;
}

function jscoverage_serializeCoverageToJSON() {
    var json = [];
    for (var file in _$jscoverage) {
        var lineArray = getArrayJSON(_$jscoverage[file].lineData);
        var fnArray = getArrayJSON(_$jscoverage[file].functionData);

        json.push(jscoverage_quote(file) + ':{"lineData":[' + lineArray.join(',') + '],"functionData":[' + fnArray.join(',') + '],"branchData":' + convertBranchDataLinesToJSON(_$jscoverage[file].branchData) + '}');
    }
    return '{' + json.join(',') + '}';
}


function jscoverage_pad(s) {
    return '0000'.substr(s.length) + s;
}

function jscoverage_html_escape(s) {
    return s.replace(/[<>\&\"\']/g, function (c) {
        return '&#' + c.charCodeAt(0) + ';';
    });
}
try {
  if (typeof top === 'object' && top !== null && typeof top.opener === 'object' && top.opener !== null) {
    // this is a browser window that was opened from another window

    if (! top.opener._$jscoverage) {
      top.opener._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null) {
    // this is a browser window

    try {
      if (typeof top.opener === 'object' && top.opener !== null && top.opener._$jscoverage) {
        top._$jscoverage = top.opener._$jscoverage;
      }
    }
    catch (e) {}

    if (! top._$jscoverage) {
      top._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null && top._$jscoverage) {
    this._$jscoverage = top._$jscoverage;
  }
}
catch (e) {}
if (! this._$jscoverage) {
  this._$jscoverage = {};
}
if (! _$jscoverage['/tree/node.js']) {
  _$jscoverage['/tree/node.js'] = {};
  _$jscoverage['/tree/node.js'].lineData = [];
  _$jscoverage['/tree/node.js'].lineData[6] = 0;
  _$jscoverage['/tree/node.js'].lineData[7] = 0;
  _$jscoverage['/tree/node.js'].lineData[8] = 0;
  _$jscoverage['/tree/node.js'].lineData[10] = 0;
  _$jscoverage['/tree/node.js'].lineData[13] = 0;
  _$jscoverage['/tree/node.js'].lineData[28] = 0;
  _$jscoverage['/tree/node.js'].lineData[29] = 0;
  _$jscoverage['/tree/node.js'].lineData[36] = 0;
  _$jscoverage['/tree/node.js'].lineData[38] = 0;
  _$jscoverage['/tree/node.js'].lineData[49] = 0;
  _$jscoverage['/tree/node.js'].lineData[50] = 0;
  _$jscoverage['/tree/node.js'].lineData[51] = 0;
  _$jscoverage['/tree/node.js'].lineData[56] = 0;
  _$jscoverage['/tree/node.js'].lineData[57] = 0;
  _$jscoverage['/tree/node.js'].lineData[63] = 0;
  _$jscoverage['/tree/node.js'].lineData[73] = 0;
  _$jscoverage['/tree/node.js'].lineData[75] = 0;
  _$jscoverage['/tree/node.js'].lineData[80] = 0;
  _$jscoverage['/tree/node.js'].lineData[81] = 0;
  _$jscoverage['/tree/node.js'].lineData[86] = 0;
  _$jscoverage['/tree/node.js'].lineData[87] = 0;
  _$jscoverage['/tree/node.js'].lineData[92] = 0;
  _$jscoverage['/tree/node.js'].lineData[93] = 0;
  _$jscoverage['/tree/node.js'].lineData[98] = 0;
  _$jscoverage['/tree/node.js'].lineData[99] = 0;
  _$jscoverage['/tree/node.js'].lineData[104] = 0;
  _$jscoverage['/tree/node.js'].lineData[105] = 0;
  _$jscoverage['/tree/node.js'].lineData[107] = 0;
  _$jscoverage['/tree/node.js'].lineData[109] = 0;
  _$jscoverage['/tree/node.js'].lineData[114] = 0;
  _$jscoverage['/tree/node.js'].lineData[115] = 0;
  _$jscoverage['/tree/node.js'].lineData[116] = 0;
  _$jscoverage['/tree/node.js'].lineData[118] = 0;
  _$jscoverage['/tree/node.js'].lineData[121] = 0;
  _$jscoverage['/tree/node.js'].lineData[124] = 0;
  _$jscoverage['/tree/node.js'].lineData[125] = 0;
  _$jscoverage['/tree/node.js'].lineData[128] = 0;
  _$jscoverage['/tree/node.js'].lineData[129] = 0;
  _$jscoverage['/tree/node.js'].lineData[132] = 0;
  _$jscoverage['/tree/node.js'].lineData[136] = 0;
  _$jscoverage['/tree/node.js'].lineData[140] = 0;
  _$jscoverage['/tree/node.js'].lineData[141] = 0;
  _$jscoverage['/tree/node.js'].lineData[143] = 0;
  _$jscoverage['/tree/node.js'].lineData[144] = 0;
  _$jscoverage['/tree/node.js'].lineData[145] = 0;
  _$jscoverage['/tree/node.js'].lineData[146] = 0;
  _$jscoverage['/tree/node.js'].lineData[148] = 0;
  _$jscoverage['/tree/node.js'].lineData[152] = 0;
  _$jscoverage['/tree/node.js'].lineData[156] = 0;
  _$jscoverage['/tree/node.js'].lineData[157] = 0;
  _$jscoverage['/tree/node.js'].lineData[159] = 0;
  _$jscoverage['/tree/node.js'].lineData[160] = 0;
  _$jscoverage['/tree/node.js'].lineData[161] = 0;
  _$jscoverage['/tree/node.js'].lineData[162] = 0;
  _$jscoverage['/tree/node.js'].lineData[164] = 0;
  _$jscoverage['/tree/node.js'].lineData[171] = 0;
  _$jscoverage['/tree/node.js'].lineData[176] = 0;
  _$jscoverage['/tree/node.js'].lineData[177] = 0;
  _$jscoverage['/tree/node.js'].lineData[181] = 0;
  _$jscoverage['/tree/node.js'].lineData[182] = 0;
  _$jscoverage['/tree/node.js'].lineData[183] = 0;
  _$jscoverage['/tree/node.js'].lineData[184] = 0;
  _$jscoverage['/tree/node.js'].lineData[186] = 0;
  _$jscoverage['/tree/node.js'].lineData[187] = 0;
  _$jscoverage['/tree/node.js'].lineData[189] = 0;
  _$jscoverage['/tree/node.js'].lineData[196] = 0;
  _$jscoverage['/tree/node.js'].lineData[197] = 0;
  _$jscoverage['/tree/node.js'].lineData[199] = 0;
  _$jscoverage['/tree/node.js'].lineData[200] = 0;
  _$jscoverage['/tree/node.js'].lineData[205] = 0;
  _$jscoverage['/tree/node.js'].lineData[212] = 0;
  _$jscoverage['/tree/node.js'].lineData[213] = 0;
  _$jscoverage['/tree/node.js'].lineData[214] = 0;
  _$jscoverage['/tree/node.js'].lineData[216] = 0;
  _$jscoverage['/tree/node.js'].lineData[217] = 0;
  _$jscoverage['/tree/node.js'].lineData[218] = 0;
  _$jscoverage['/tree/node.js'].lineData[219] = 0;
  _$jscoverage['/tree/node.js'].lineData[221] = 0;
  _$jscoverage['/tree/node.js'].lineData[222] = 0;
  _$jscoverage['/tree/node.js'].lineData[226] = 0;
  _$jscoverage['/tree/node.js'].lineData[227] = 0;
  _$jscoverage['/tree/node.js'].lineData[235] = 0;
  _$jscoverage['/tree/node.js'].lineData[241] = 0;
  _$jscoverage['/tree/node.js'].lineData[245] = 0;
  _$jscoverage['/tree/node.js'].lineData[249] = 0;
  _$jscoverage['/tree/node.js'].lineData[251] = 0;
  _$jscoverage['/tree/node.js'].lineData[252] = 0;
  _$jscoverage['/tree/node.js'].lineData[253] = 0;
  _$jscoverage['/tree/node.js'].lineData[254] = 0;
  _$jscoverage['/tree/node.js'].lineData[258] = 0;
  _$jscoverage['/tree/node.js'].lineData[260] = 0;
  _$jscoverage['/tree/node.js'].lineData[261] = 0;
  _$jscoverage['/tree/node.js'].lineData[262] = 0;
  _$jscoverage['/tree/node.js'].lineData[263] = 0;
  _$jscoverage['/tree/node.js'].lineData[264] = 0;
  _$jscoverage['/tree/node.js'].lineData[272] = 0;
  _$jscoverage['/tree/node.js'].lineData[273] = 0;
  _$jscoverage['/tree/node.js'].lineData[274] = 0;
  _$jscoverage['/tree/node.js'].lineData[275] = 0;
  _$jscoverage['/tree/node.js'].lineData[283] = 0;
  _$jscoverage['/tree/node.js'].lineData[284] = 0;
  _$jscoverage['/tree/node.js'].lineData[285] = 0;
  _$jscoverage['/tree/node.js'].lineData[286] = 0;
  _$jscoverage['/tree/node.js'].lineData[311] = 0;
  _$jscoverage['/tree/node.js'].lineData[312] = 0;
  _$jscoverage['/tree/node.js'].lineData[313] = 0;
  _$jscoverage['/tree/node.js'].lineData[314] = 0;
  _$jscoverage['/tree/node.js'].lineData[315] = 0;
  _$jscoverage['/tree/node.js'].lineData[317] = 0;
  _$jscoverage['/tree/node.js'].lineData[323] = 0;
  _$jscoverage['/tree/node.js'].lineData[329] = 0;
  _$jscoverage['/tree/node.js'].lineData[339] = 0;
  _$jscoverage['/tree/node.js'].lineData[349] = 0;
  _$jscoverage['/tree/node.js'].lineData[372] = 0;
  _$jscoverage['/tree/node.js'].lineData[391] = 0;
  _$jscoverage['/tree/node.js'].lineData[393] = 0;
  _$jscoverage['/tree/node.js'].lineData[394] = 0;
  _$jscoverage['/tree/node.js'].lineData[396] = 0;
  _$jscoverage['/tree/node.js'].lineData[415] = 0;
  _$jscoverage['/tree/node.js'].lineData[426] = 0;
  _$jscoverage['/tree/node.js'].lineData[427] = 0;
  _$jscoverage['/tree/node.js'].lineData[428] = 0;
  _$jscoverage['/tree/node.js'].lineData[429] = 0;
  _$jscoverage['/tree/node.js'].lineData[433] = 0;
  _$jscoverage['/tree/node.js'].lineData[434] = 0;
  _$jscoverage['/tree/node.js'].lineData[435] = 0;
  _$jscoverage['/tree/node.js'].lineData[436] = 0;
  _$jscoverage['/tree/node.js'].lineData[437] = 0;
  _$jscoverage['/tree/node.js'].lineData[441] = 0;
  _$jscoverage['/tree/node.js'].lineData[442] = 0;
  _$jscoverage['/tree/node.js'].lineData[443] = 0;
  _$jscoverage['/tree/node.js'].lineData[444] = 0;
  _$jscoverage['/tree/node.js'].lineData[449] = 0;
  _$jscoverage['/tree/node.js'].lineData[450] = 0;
  _$jscoverage['/tree/node.js'].lineData[456] = 0;
  _$jscoverage['/tree/node.js'].lineData[459] = 0;
  _$jscoverage['/tree/node.js'].lineData[460] = 0;
  _$jscoverage['/tree/node.js'].lineData[462] = 0;
  _$jscoverage['/tree/node.js'].lineData[465] = 0;
  _$jscoverage['/tree/node.js'].lineData[466] = 0;
  _$jscoverage['/tree/node.js'].lineData[468] = 0;
  _$jscoverage['/tree/node.js'].lineData[469] = 0;
  _$jscoverage['/tree/node.js'].lineData[472] = 0;
  _$jscoverage['/tree/node.js'].lineData[476] = 0;
  _$jscoverage['/tree/node.js'].lineData[477] = 0;
  _$jscoverage['/tree/node.js'].lineData[478] = 0;
  _$jscoverage['/tree/node.js'].lineData[479] = 0;
  _$jscoverage['/tree/node.js'].lineData[481] = 0;
  _$jscoverage['/tree/node.js'].lineData[483] = 0;
  _$jscoverage['/tree/node.js'].lineData[487] = 0;
  _$jscoverage['/tree/node.js'].lineData[488] = 0;
  _$jscoverage['/tree/node.js'].lineData[491] = 0;
  _$jscoverage['/tree/node.js'].lineData[492] = 0;
  _$jscoverage['/tree/node.js'].lineData[496] = 0;
  _$jscoverage['/tree/node.js'].lineData[497] = 0;
  _$jscoverage['/tree/node.js'].lineData[498] = 0;
  _$jscoverage['/tree/node.js'].lineData[499] = 0;
  _$jscoverage['/tree/node.js'].lineData[501] = 0;
  _$jscoverage['/tree/node.js'].lineData[508] = 0;
  _$jscoverage['/tree/node.js'].lineData[509] = 0;
  _$jscoverage['/tree/node.js'].lineData[512] = 0;
  _$jscoverage['/tree/node.js'].lineData[513] = 0;
  _$jscoverage['/tree/node.js'].lineData[514] = 0;
  _$jscoverage['/tree/node.js'].lineData[515] = 0;
  _$jscoverage['/tree/node.js'].lineData[516] = 0;
  _$jscoverage['/tree/node.js'].lineData[520] = 0;
  _$jscoverage['/tree/node.js'].lineData[521] = 0;
  _$jscoverage['/tree/node.js'].lineData[522] = 0;
  _$jscoverage['/tree/node.js'].lineData[524] = 0;
  _$jscoverage['/tree/node.js'].lineData[525] = 0;
  _$jscoverage['/tree/node.js'].lineData[526] = 0;
  _$jscoverage['/tree/node.js'].lineData[528] = 0;
  _$jscoverage['/tree/node.js'].lineData[533] = 0;
  _$jscoverage['/tree/node.js'].lineData[534] = 0;
  _$jscoverage['/tree/node.js'].lineData[535] = 0;
  _$jscoverage['/tree/node.js'].lineData[536] = 0;
  _$jscoverage['/tree/node.js'].lineData[539] = 0;
  _$jscoverage['/tree/node.js'].lineData[540] = 0;
  _$jscoverage['/tree/node.js'].lineData[541] = 0;
  _$jscoverage['/tree/node.js'].lineData[542] = 0;
}
if (! _$jscoverage['/tree/node.js'].functionData) {
  _$jscoverage['/tree/node.js'].functionData = [];
  _$jscoverage['/tree/node.js'].functionData[0] = 0;
  _$jscoverage['/tree/node.js'].functionData[1] = 0;
  _$jscoverage['/tree/node.js'].functionData[2] = 0;
  _$jscoverage['/tree/node.js'].functionData[3] = 0;
  _$jscoverage['/tree/node.js'].functionData[4] = 0;
  _$jscoverage['/tree/node.js'].functionData[5] = 0;
  _$jscoverage['/tree/node.js'].functionData[6] = 0;
  _$jscoverage['/tree/node.js'].functionData[7] = 0;
  _$jscoverage['/tree/node.js'].functionData[8] = 0;
  _$jscoverage['/tree/node.js'].functionData[9] = 0;
  _$jscoverage['/tree/node.js'].functionData[10] = 0;
  _$jscoverage['/tree/node.js'].functionData[11] = 0;
  _$jscoverage['/tree/node.js'].functionData[12] = 0;
  _$jscoverage['/tree/node.js'].functionData[13] = 0;
  _$jscoverage['/tree/node.js'].functionData[14] = 0;
  _$jscoverage['/tree/node.js'].functionData[15] = 0;
  _$jscoverage['/tree/node.js'].functionData[16] = 0;
  _$jscoverage['/tree/node.js'].functionData[17] = 0;
  _$jscoverage['/tree/node.js'].functionData[18] = 0;
  _$jscoverage['/tree/node.js'].functionData[19] = 0;
  _$jscoverage['/tree/node.js'].functionData[20] = 0;
  _$jscoverage['/tree/node.js'].functionData[21] = 0;
  _$jscoverage['/tree/node.js'].functionData[22] = 0;
  _$jscoverage['/tree/node.js'].functionData[23] = 0;
  _$jscoverage['/tree/node.js'].functionData[24] = 0;
  _$jscoverage['/tree/node.js'].functionData[25] = 0;
  _$jscoverage['/tree/node.js'].functionData[26] = 0;
  _$jscoverage['/tree/node.js'].functionData[27] = 0;
  _$jscoverage['/tree/node.js'].functionData[28] = 0;
  _$jscoverage['/tree/node.js'].functionData[29] = 0;
  _$jscoverage['/tree/node.js'].functionData[30] = 0;
  _$jscoverage['/tree/node.js'].functionData[31] = 0;
  _$jscoverage['/tree/node.js'].functionData[32] = 0;
  _$jscoverage['/tree/node.js'].functionData[33] = 0;
  _$jscoverage['/tree/node.js'].functionData[34] = 0;
  _$jscoverage['/tree/node.js'].functionData[35] = 0;
  _$jscoverage['/tree/node.js'].functionData[36] = 0;
  _$jscoverage['/tree/node.js'].functionData[37] = 0;
  _$jscoverage['/tree/node.js'].functionData[38] = 0;
  _$jscoverage['/tree/node.js'].functionData[39] = 0;
}
if (! _$jscoverage['/tree/node.js'].branchData) {
  _$jscoverage['/tree/node.js'].branchData = {};
  _$jscoverage['/tree/node.js'].branchData['104'] = [];
  _$jscoverage['/tree/node.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['104'][2] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['104'][3] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['114'] = [];
  _$jscoverage['/tree/node.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['114'][2] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['115'] = [];
  _$jscoverage['/tree/node.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['128'] = [];
  _$jscoverage['/tree/node.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['140'] = [];
  _$jscoverage['/tree/node.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['145'] = [];
  _$jscoverage['/tree/node.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['156'] = [];
  _$jscoverage['/tree/node.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['161'] = [];
  _$jscoverage['/tree/node.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['183'] = [];
  _$jscoverage['/tree/node.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['199'] = [];
  _$jscoverage['/tree/node.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['212'] = [];
  _$jscoverage['/tree/node.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['217'] = [];
  _$jscoverage['/tree/node.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['263'] = [];
  _$jscoverage['/tree/node.js'].branchData['263'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['263'][2] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['312'] = [];
  _$jscoverage['/tree/node.js'].branchData['312'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['314'] = [];
  _$jscoverage['/tree/node.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['372'] = [];
  _$jscoverage['/tree/node.js'].branchData['372'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['393'] = [];
  _$jscoverage['/tree/node.js'].branchData['393'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['428'] = [];
  _$jscoverage['/tree/node.js'].branchData['428'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['435'] = [];
  _$jscoverage['/tree/node.js'].branchData['435'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['443'] = [];
  _$jscoverage['/tree/node.js'].branchData['443'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['451'] = [];
  _$jscoverage['/tree/node.js'].branchData['451'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['452'] = [];
  _$jscoverage['/tree/node.js'].branchData['452'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['456'] = [];
  _$jscoverage['/tree/node.js'].branchData['456'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['456'][2] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['462'] = [];
  _$jscoverage['/tree/node.js'].branchData['462'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['462'][2] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['462'][3] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['462'][4] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['468'] = [];
  _$jscoverage['/tree/node.js'].branchData['468'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['478'] = [];
  _$jscoverage['/tree/node.js'].branchData['478'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['491'] = [];
  _$jscoverage['/tree/node.js'].branchData['491'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['498'] = [];
  _$jscoverage['/tree/node.js'].branchData['498'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['514'] = [];
  _$jscoverage['/tree/node.js'].branchData['514'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['521'] = [];
  _$jscoverage['/tree/node.js'].branchData['521'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['525'] = [];
  _$jscoverage['/tree/node.js'].branchData['525'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['539'] = [];
  _$jscoverage['/tree/node.js'].branchData['539'][1] = new BranchData();
}
_$jscoverage['/tree/node.js'].branchData['539'][1].init(183, 11, 'index < len');
function visit68_539_1(result) {
  _$jscoverage['/tree/node.js'].branchData['539'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['525'][1].init(18, 28, 'typeof setDepth === \'number\'');
function visit67_525_1(result) {
  _$jscoverage['/tree/node.js'].branchData['525'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['521'][1].init(14, 22, 'setDepth !== undefined');
function visit66_521_1(result) {
  _$jscoverage['/tree/node.js'].branchData['521'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['514'][1].init(52, 4, 'tree');
function visit65_514_1(result) {
  _$jscoverage['/tree/node.js'].branchData['514'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['498'][1].init(298, 37, '!n && (parent = parent.get(\'parent\'))');
function visit64_498_1(result) {
  _$jscoverage['/tree/node.js'].branchData['498'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['491'][1].init(97, 39, 'self.get(\'expanded\') && children.length');
function visit63_491_1(result) {
  _$jscoverage['/tree/node.js'].branchData['491'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['478'][1].init(47, 5, '!prev');
function visit62_478_1(result) {
  _$jscoverage['/tree/node.js'].branchData['478'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['468'][1].init(95, 41, '!self.get(\'expanded\') || !children.length');
function visit61_468_1(result) {
  _$jscoverage['/tree/node.js'].branchData['468'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['462'][4].init(122, 20, 'isLeaf === undefined');
function visit60_462_4(result) {
  _$jscoverage['/tree/node.js'].branchData['462'][4].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['462'][3].init(122, 51, 'isLeaf === undefined && self.get(\'children\').length');
function visit59_462_3(result) {
  _$jscoverage['/tree/node.js'].branchData['462'][3].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['462'][2].init(101, 16, 'isLeaf === false');
function visit58_462_2(result) {
  _$jscoverage['/tree/node.js'].branchData['462'][2].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['462'][1].init(101, 73, 'isLeaf === false || (isLeaf === undefined && self.get(\'children\').length)');
function visit57_462_1(result) {
  _$jscoverage['/tree/node.js'].branchData['462'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['456'][2].init(253, 18, 'lastChild === self');
function visit56_456_2(result) {
  _$jscoverage['/tree/node.js'].branchData['456'][2].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['456'][1].init(239, 32, '!lastChild || lastChild === self');
function visit55_456_1(result) {
  _$jscoverage['/tree/node.js'].branchData['456'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['452'][1].init(115, 41, 'children && children[children.length - 1]');
function visit54_452_1(result) {
  _$jscoverage['/tree/node.js'].branchData['452'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['451'][1].init(56, 32, 'parent && parent.get(\'children\')');
function visit53_451_1(result) {
  _$jscoverage['/tree/node.js'].branchData['451'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['443'][1].init(40, 17, 'e.target === self');
function visit52_443_1(result) {
  _$jscoverage['/tree/node.js'].branchData['443'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['435'][1].init(40, 17, 'e.target === self');
function visit51_435_1(result) {
  _$jscoverage['/tree/node.js'].branchData['435'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['428'][1].init(40, 17, 'e.target === self');
function visit50_428_1(result) {
  _$jscoverage['/tree/node.js'].branchData['428'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['393'][1].init(105, 20, 'from && !from.isTree');
function visit49_393_1(result) {
  _$jscoverage['/tree/node.js'].branchData['393'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['372'][1].init(29, 48, 'this.get(\'childrenEl\').css(\'display\') !== \'none\'');
function visit48_372_1(result) {
  _$jscoverage['/tree/node.js'].branchData['372'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['314'][1].init(180, 43, 'el.hasClass(self.getBaseCssClass(\'folder\'))');
function visit47_314_1(result) {
  _$jscoverage['/tree/node.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['312'][1].init(64, 41, 'el.hasClass(self.getBaseCssClass(\'leaf\'))');
function visit46_312_1(result) {
  _$jscoverage['/tree/node.js'].branchData['312'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['263'][2].init(281, 32, 'e && e.byPassSetTreeSelectedItem');
function visit45_263_2(result) {
  _$jscoverage['/tree/node.js'].branchData['263'][2].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['263'][1].init(279, 35, '!(e && e.byPassSetTreeSelectedItem)');
function visit44_263_1(result) {
  _$jscoverage['/tree/node.js'].branchData['263'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['217'][1].init(76, 8, 'expanded');
function visit43_217_1(result) {
  _$jscoverage['/tree/node.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['212'][1].init(273, 10, 'isNodeLeaf');
function visit42_212_1(result) {
  _$jscoverage['/tree/node.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['199'][1].init(159, 25, 'self === self.get(\'tree\')');
function visit41_199_1(result) {
  _$jscoverage['/tree/node.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['183'][1].init(322, 39, 'target.equals(self.get(\'expandIconEl\'))');
function visit40_183_1(result) {
  _$jscoverage['/tree/node.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['161'][1].init(314, 11, 'index === 0');
function visit39_161_1(result) {
  _$jscoverage['/tree/node.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['156'][1].init(145, 7, '!parent');
function visit38_156_1(result) {
  _$jscoverage['/tree/node.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['145'][1].init(314, 29, 'index === siblings.length - 1');
function visit37_145_1(result) {
  _$jscoverage['/tree/node.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['140'][1].init(145, 7, '!parent');
function visit36_140_1(result) {
  _$jscoverage['/tree/node.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['128'][1].init(2165, 16, 'nodeToBeSelected');
function visit35_128_1(result) {
  _$jscoverage['/tree/node.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['115'][1].init(30, 9, '!expanded');
function visit34_115_1(result) {
  _$jscoverage['/tree/node.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['114'][2].init(63, 16, 'isLeaf === false');
function visit33_114_2(result) {
  _$jscoverage['/tree/node.js'].branchData['114'][2].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['114'][1].init(44, 35, 'children.length || isLeaf === false');
function visit32_114_1(result) {
  _$jscoverage['/tree/node.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['104'][3].init(75, 16, 'isLeaf === false');
function visit31_104_3(result) {
  _$jscoverage['/tree/node.js'].branchData['104'][3].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['104'][2].init(56, 35, 'children.length || isLeaf === false');
function visit30_104_2(result) {
  _$jscoverage['/tree/node.js'].branchData['104'][2].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['104'][1].init(43, 49, 'expanded && (children.length || isLeaf === false)');
function visit29_104_1(result) {
  _$jscoverage['/tree/node.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/tree/node.js'].functionData[0]++;
  _$jscoverage['/tree/node.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/tree/node.js'].lineData[8]++;
  var Container = require('component/container');
  _$jscoverage['/tree/node.js'].lineData[10]++;
  var $ = Node.all, KeyCode = Node.KeyCode;
  _$jscoverage['/tree/node.js'].lineData[13]++;
  var SELECTED_CLS = 'selected', EXPAND_EL_CLS = 'expand-icon', COMMON_EXPAND_EL_CLS = 'expand-icon-{t}', EXPAND_ICON_EL_FILE_CLS = [COMMON_EXPAND_EL_CLS].join(' '), EXPAND_ICON_EL_FOLDER_EXPAND_CLS = [COMMON_EXPAND_EL_CLS + 'minus'].join(' '), EXPAND_ICON_EL_FOLDER_COLLAPSE_CLS = [COMMON_EXPAND_EL_CLS + 'plus'].join(' '), ICON_EL_FILE_CLS = ['file-icon'].join(' '), ICON_EL_FOLDER_EXPAND_CLS = ['expanded-folder-icon'].join(' '), ICON_EL_FOLDER_COLLAPSE_CLS = ['collapsed-folder-icon'].join(' '), ROW_EL_CLS = 'row', CHILDREN_CLS = 'children', CHILDREN_CLS_L = 'lchildren';
  _$jscoverage['/tree/node.js'].lineData[28]++;
  var TreeNodeTpl = require('./node-xtpl');
  _$jscoverage['/tree/node.js'].lineData[29]++;
  var ContentBox = require('component/extension/content-box');
  _$jscoverage['/tree/node.js'].lineData[36]++;
  return Container.extend([ContentBox], {
  beforeCreateDom: function(renderData) {
  _$jscoverage['/tree/node.js'].functionData[1]++;
  _$jscoverage['/tree/node.js'].lineData[38]++;
  S.mix(renderData.elAttrs, {
  role: 'tree-node', 
  'aria-labelledby': 'ks-content' + renderData.id, 
  'aria-expanded': renderData.expanded ? 'true' : 'false', 
  'aria-selected': renderData.selected ? 'true' : 'false', 
  'aria-level': renderData.depth, 
  title: renderData.tooltip});
}, 
  bindUI: function() {
  _$jscoverage['/tree/node.js'].functionData[2]++;
  _$jscoverage['/tree/node.js'].lineData[49]++;
  this.on('afterAddChild', onAddChild);
  _$jscoverage['/tree/node.js'].lineData[50]++;
  this.on('afterRemoveChild', onRemoveChild);
  _$jscoverage['/tree/node.js'].lineData[51]++;
  this.on('afterAddChild afterRemoveChild', syncAriaSetSize);
}, 
  syncUI: function() {
  _$jscoverage['/tree/node.js'].functionData[3]++;
  _$jscoverage['/tree/node.js'].lineData[56]++;
  refreshCss(this);
  _$jscoverage['/tree/node.js'].lineData[57]++;
  syncAriaSetSize.call(this, {
  target: this});
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/tree/node.js'].functionData[4]++;
  _$jscoverage['/tree/node.js'].lineData[63]++;
  var self = this, processed = true, tree = self.get('tree'), expanded = self.get('expanded'), nodeToBeSelected, isLeaf = self.get('isLeaf'), children = self.get('children'), keyCode = e.keyCode;
  _$jscoverage['/tree/node.js'].lineData[73]++;
  switch (keyCode) {
    case KeyCode.ENTER:
      _$jscoverage['/tree/node.js'].lineData[75]++;
      return self.handleClickInternal(e);
    case KeyCode.HOME:
      _$jscoverage['/tree/node.js'].lineData[80]++;
      nodeToBeSelected = tree;
      _$jscoverage['/tree/node.js'].lineData[81]++;
      break;
    case KeyCode.END:
      _$jscoverage['/tree/node.js'].lineData[86]++;
      nodeToBeSelected = getLastVisibleDescendant(tree);
      _$jscoverage['/tree/node.js'].lineData[87]++;
      break;
    case KeyCode.UP:
      _$jscoverage['/tree/node.js'].lineData[92]++;
      nodeToBeSelected = getPreviousVisibleNode(self);
      _$jscoverage['/tree/node.js'].lineData[93]++;
      break;
    case KeyCode.DOWN:
      _$jscoverage['/tree/node.js'].lineData[98]++;
      nodeToBeSelected = getNextVisibleNode(self);
      _$jscoverage['/tree/node.js'].lineData[99]++;
      break;
    case KeyCode.LEFT:
      _$jscoverage['/tree/node.js'].lineData[104]++;
      if (visit29_104_1(expanded && (visit30_104_2(children.length || visit31_104_3(isLeaf === false))))) {
        _$jscoverage['/tree/node.js'].lineData[105]++;
        self.set('expanded', false);
      } else {
        _$jscoverage['/tree/node.js'].lineData[107]++;
        nodeToBeSelected = self.get('parent');
      }
      _$jscoverage['/tree/node.js'].lineData[109]++;
      break;
    case KeyCode.RIGHT:
      _$jscoverage['/tree/node.js'].lineData[114]++;
      if (visit32_114_1(children.length || visit33_114_2(isLeaf === false))) {
        _$jscoverage['/tree/node.js'].lineData[115]++;
        if (visit34_115_1(!expanded)) {
          _$jscoverage['/tree/node.js'].lineData[116]++;
          self.set('expanded', true);
        } else {
          _$jscoverage['/tree/node.js'].lineData[118]++;
          nodeToBeSelected = children[0];
        }
      }
      _$jscoverage['/tree/node.js'].lineData[121]++;
      break;
    default:
      _$jscoverage['/tree/node.js'].lineData[124]++;
      processed = false;
      _$jscoverage['/tree/node.js'].lineData[125]++;
      break;
  }
  _$jscoverage['/tree/node.js'].lineData[128]++;
  if (visit35_128_1(nodeToBeSelected)) {
    _$jscoverage['/tree/node.js'].lineData[129]++;
    nodeToBeSelected.select();
  }
  _$jscoverage['/tree/node.js'].lineData[132]++;
  return processed;
}, 
  next: function() {
  _$jscoverage['/tree/node.js'].functionData[5]++;
  _$jscoverage['/tree/node.js'].lineData[136]++;
  var self = this, parent = self.get('parent'), siblings, index;
  _$jscoverage['/tree/node.js'].lineData[140]++;
  if (visit36_140_1(!parent)) {
    _$jscoverage['/tree/node.js'].lineData[141]++;
    return null;
  }
  _$jscoverage['/tree/node.js'].lineData[143]++;
  siblings = parent.get('children');
  _$jscoverage['/tree/node.js'].lineData[144]++;
  index = S.indexOf(self, siblings);
  _$jscoverage['/tree/node.js'].lineData[145]++;
  if (visit37_145_1(index === siblings.length - 1)) {
    _$jscoverage['/tree/node.js'].lineData[146]++;
    return null;
  }
  _$jscoverage['/tree/node.js'].lineData[148]++;
  return siblings[index + 1];
}, 
  prev: function() {
  _$jscoverage['/tree/node.js'].functionData[6]++;
  _$jscoverage['/tree/node.js'].lineData[152]++;
  var self = this, parent = self.get('parent'), siblings, index;
  _$jscoverage['/tree/node.js'].lineData[156]++;
  if (visit38_156_1(!parent)) {
    _$jscoverage['/tree/node.js'].lineData[157]++;
    return null;
  }
  _$jscoverage['/tree/node.js'].lineData[159]++;
  siblings = parent.get('children');
  _$jscoverage['/tree/node.js'].lineData[160]++;
  index = S.indexOf(self, siblings);
  _$jscoverage['/tree/node.js'].lineData[161]++;
  if (visit39_161_1(index === 0)) {
    _$jscoverage['/tree/node.js'].lineData[162]++;
    return null;
  }
  _$jscoverage['/tree/node.js'].lineData[164]++;
  return siblings[index - 1];
}, 
  select: function() {
  _$jscoverage['/tree/node.js'].functionData[7]++;
  _$jscoverage['/tree/node.js'].lineData[171]++;
  this.set('selected', true);
}, 
  handleClickInternal: function(e) {
  _$jscoverage['/tree/node.js'].functionData[8]++;
  _$jscoverage['/tree/node.js'].lineData[176]++;
  e.stopPropagation();
  _$jscoverage['/tree/node.js'].lineData[177]++;
  var self = this, target = $(e.target), expanded = self.get('expanded'), tree = self.get('tree');
  _$jscoverage['/tree/node.js'].lineData[181]++;
  tree.focus();
  _$jscoverage['/tree/node.js'].lineData[182]++;
  self.callSuper(e);
  _$jscoverage['/tree/node.js'].lineData[183]++;
  if (visit40_183_1(target.equals(self.get('expandIconEl')))) {
    _$jscoverage['/tree/node.js'].lineData[184]++;
    self.set('expanded', !expanded);
  } else {
    _$jscoverage['/tree/node.js'].lineData[186]++;
    self.select();
    _$jscoverage['/tree/node.js'].lineData[187]++;
    self.fire('click');
  }
  _$jscoverage['/tree/node.js'].lineData[189]++;
  return true;
}, 
  createChildren: function() {
  _$jscoverage['/tree/node.js'].functionData[9]++;
  _$jscoverage['/tree/node.js'].lineData[196]++;
  var self = this;
  _$jscoverage['/tree/node.js'].lineData[197]++;
  self.renderChildren.apply(self, arguments);
  _$jscoverage['/tree/node.js'].lineData[199]++;
  if (visit41_199_1(self === self.get('tree'))) {
    _$jscoverage['/tree/node.js'].lineData[200]++;
    updateSubTreeStatus(self, self, -1, 0);
  }
}, 
  refreshCss: function(isNodeSingleOrLast, isNodeLeaf) {
  _$jscoverage['/tree/node.js'].functionData[10]++;
  _$jscoverage['/tree/node.js'].lineData[205]++;
  var self = this, iconEl = self.get('iconEl'), iconElCss, expandElCss, expandIconEl = self.get('expandIconEl'), childrenEl = self.getChildrenContainerEl();
  _$jscoverage['/tree/node.js'].lineData[212]++;
  if (visit42_212_1(isNodeLeaf)) {
    _$jscoverage['/tree/node.js'].lineData[213]++;
    iconElCss = ICON_EL_FILE_CLS;
    _$jscoverage['/tree/node.js'].lineData[214]++;
    expandElCss = EXPAND_ICON_EL_FILE_CLS;
  } else {
    _$jscoverage['/tree/node.js'].lineData[216]++;
    var expanded = self.get('expanded');
    _$jscoverage['/tree/node.js'].lineData[217]++;
    if (visit43_217_1(expanded)) {
      _$jscoverage['/tree/node.js'].lineData[218]++;
      iconElCss = ICON_EL_FOLDER_EXPAND_CLS;
      _$jscoverage['/tree/node.js'].lineData[219]++;
      expandElCss = EXPAND_ICON_EL_FOLDER_EXPAND_CLS;
    } else {
      _$jscoverage['/tree/node.js'].lineData[221]++;
      iconElCss = ICON_EL_FOLDER_COLLAPSE_CLS;
      _$jscoverage['/tree/node.js'].lineData[222]++;
      expandElCss = EXPAND_ICON_EL_FOLDER_COLLAPSE_CLS;
    }
  }
  _$jscoverage['/tree/node.js'].lineData[226]++;
  iconEl[0].className = self.getBaseCssClasses(iconElCss);
  _$jscoverage['/tree/node.js'].lineData[227]++;
  expandIconEl[0].className = self.getBaseCssClasses([EXPAND_EL_CLS, S.substitute(expandElCss, {
  t: isNodeSingleOrLast ? 'l' : 't'})]);
  _$jscoverage['/tree/node.js'].lineData[235]++;
  childrenEl[0].className = self.getBaseCssClasses((isNodeSingleOrLast ? CHILDREN_CLS_L : CHILDREN_CLS));
}, 
  _onSetDepth: function(v) {
  _$jscoverage['/tree/node.js'].functionData[11]++;
  _$jscoverage['/tree/node.js'].lineData[241]++;
  this.el.setAttribute('aria-level', v);
}, 
  getChildrenContainerEl: function() {
  _$jscoverage['/tree/node.js'].functionData[12]++;
  _$jscoverage['/tree/node.js'].lineData[245]++;
  return this.get('childrenEl');
}, 
  _onSetExpanded: function(v) {
  _$jscoverage['/tree/node.js'].functionData[13]++;
  _$jscoverage['/tree/node.js'].lineData[249]++;
  var self = this, childrenEl = self.getChildrenContainerEl();
  _$jscoverage['/tree/node.js'].lineData[251]++;
  childrenEl[v ? 'show' : 'hide']();
  _$jscoverage['/tree/node.js'].lineData[252]++;
  self.el.setAttribute('aria-expanded', v);
  _$jscoverage['/tree/node.js'].lineData[253]++;
  refreshCss(self);
  _$jscoverage['/tree/node.js'].lineData[254]++;
  self.fire(v ? 'expand' : 'collapse');
}, 
  _onSetSelected: function(v, e) {
  _$jscoverage['/tree/node.js'].functionData[14]++;
  _$jscoverage['/tree/node.js'].lineData[258]++;
  var self = this, rowEl = self.get('rowEl');
  _$jscoverage['/tree/node.js'].lineData[260]++;
  rowEl[v ? 'addClass' : 'removeClass'](self.getBaseCssClasses(SELECTED_CLS));
  _$jscoverage['/tree/node.js'].lineData[261]++;
  self.el.setAttribute('aria-selected', v);
  _$jscoverage['/tree/node.js'].lineData[262]++;
  var tree = this.get('tree');
  _$jscoverage['/tree/node.js'].lineData[263]++;
  if (visit44_263_1(!(visit45_263_2(e && e.byPassSetTreeSelectedItem)))) {
    _$jscoverage['/tree/node.js'].lineData[264]++;
    tree.set('selectedItem', v ? this : null);
  }
}, 
  expandAll: function() {
  _$jscoverage['/tree/node.js'].functionData[15]++;
  _$jscoverage['/tree/node.js'].lineData[272]++;
  var self = this;
  _$jscoverage['/tree/node.js'].lineData[273]++;
  self.set('expanded', true);
  _$jscoverage['/tree/node.js'].lineData[274]++;
  S.each(self.get('children'), function(c) {
  _$jscoverage['/tree/node.js'].functionData[16]++;
  _$jscoverage['/tree/node.js'].lineData[275]++;
  c.expandAll();
});
}, 
  collapseAll: function() {
  _$jscoverage['/tree/node.js'].functionData[17]++;
  _$jscoverage['/tree/node.js'].lineData[283]++;
  var self = this;
  _$jscoverage['/tree/node.js'].lineData[284]++;
  self.set('expanded', false);
  _$jscoverage['/tree/node.js'].lineData[285]++;
  S.each(self.get('children'), function(c) {
  _$jscoverage['/tree/node.js'].functionData[18]++;
  _$jscoverage['/tree/node.js'].lineData[286]++;
  c.collapseAll();
});
}}, {
  ATTRS: {
  contentTpl: {
  value: TreeNodeTpl}, 
  handleGestureEvents: {
  value: false}, 
  isLeaf: {
  render: 1, 
  sync: 0, 
  parse: function(el) {
  _$jscoverage['/tree/node.js'].functionData[19]++;
  _$jscoverage['/tree/node.js'].lineData[311]++;
  var self = this;
  _$jscoverage['/tree/node.js'].lineData[312]++;
  if (visit46_312_1(el.hasClass(self.getBaseCssClass('leaf')))) {
    _$jscoverage['/tree/node.js'].lineData[313]++;
    return true;
  } else {
    _$jscoverage['/tree/node.js'].lineData[314]++;
    if (visit47_314_1(el.hasClass(self.getBaseCssClass('folder')))) {
      _$jscoverage['/tree/node.js'].lineData[315]++;
      return false;
    }
  }
  _$jscoverage['/tree/node.js'].lineData[317]++;
  return undefined;
}}, 
  rowEl: {
  selector: function() {
  _$jscoverage['/tree/node.js'].functionData[20]++;
  _$jscoverage['/tree/node.js'].lineData[323]++;
  return ('.' + this.getBaseCssClass(ROW_EL_CLS));
}}, 
  childrenEl: {
  selector: function() {
  _$jscoverage['/tree/node.js'].functionData[21]++;
  _$jscoverage['/tree/node.js'].lineData[329]++;
  return ('.' + this.getBaseCssClass(CHILDREN_CLS));
}}, 
  expandIconEl: {
  selector: function() {
  _$jscoverage['/tree/node.js'].functionData[22]++;
  _$jscoverage['/tree/node.js'].lineData[339]++;
  return ('.' + this.getBaseCssClass(EXPAND_EL_CLS));
}}, 
  iconEl: {
  selector: function() {
  _$jscoverage['/tree/node.js'].functionData[23]++;
  _$jscoverage['/tree/node.js'].lineData[349]++;
  return ('.' + this.getBaseCssClass('icon'));
}}, 
  selected: {
  render: 1, 
  sync: 0}, 
  expanded: {
  sync: 0, 
  value: false, 
  render: 1, 
  parse: function() {
  _$jscoverage['/tree/node.js'].functionData[24]++;
  _$jscoverage['/tree/node.js'].lineData[372]++;
  return visit48_372_1(this.get('childrenEl').css('display') !== 'none');
}}, 
  tooltip: {
  render: 1, 
  sync: 0}, 
  tree: {
  getter: function() {
  _$jscoverage['/tree/node.js'].functionData[25]++;
  _$jscoverage['/tree/node.js'].lineData[391]++;
  var self = this, from = self;
  _$jscoverage['/tree/node.js'].lineData[393]++;
  while (visit49_393_1(from && !from.isTree)) {
    _$jscoverage['/tree/node.js'].lineData[394]++;
    from = from.get('parent');
  }
  _$jscoverage['/tree/node.js'].lineData[396]++;
  return from;
}}, 
  depth: {
  render: 1, 
  sync: 0}, 
  focusable: {
  value: false}, 
  defaultChildCfg: {
  valueFn: function() {
  _$jscoverage['/tree/node.js'].functionData[26]++;
  _$jscoverage['/tree/node.js'].lineData[415]++;
  return {
  xclass: 'tree-node'};
}}}, 
  xclass: 'tree-node'});
  _$jscoverage['/tree/node.js'].lineData[426]++;
  function onAddChild(e) {
    _$jscoverage['/tree/node.js'].functionData[27]++;
    _$jscoverage['/tree/node.js'].lineData[427]++;
    var self = this;
    _$jscoverage['/tree/node.js'].lineData[428]++;
    if (visit50_428_1(e.target === self)) {
      _$jscoverage['/tree/node.js'].lineData[429]++;
      updateSubTreeStatus(self, e.component, self.get('depth'), e.index);
    }
  }
  _$jscoverage['/tree/node.js'].lineData[433]++;
  function onRemoveChild(e) {
    _$jscoverage['/tree/node.js'].functionData[28]++;
    _$jscoverage['/tree/node.js'].lineData[434]++;
    var self = this;
    _$jscoverage['/tree/node.js'].lineData[435]++;
    if (visit51_435_1(e.target === self)) {
      _$jscoverage['/tree/node.js'].lineData[436]++;
      recursiveSetDepth(self.get('tree'), e.component);
      _$jscoverage['/tree/node.js'].lineData[437]++;
      refreshCssForSelfAndChildren(self, e.index);
    }
  }
  _$jscoverage['/tree/node.js'].lineData[441]++;
  function syncAriaSetSize(e) {
    _$jscoverage['/tree/node.js'].functionData[29]++;
    _$jscoverage['/tree/node.js'].lineData[442]++;
    var self = this;
    _$jscoverage['/tree/node.js'].lineData[443]++;
    if (visit52_443_1(e.target === self)) {
      _$jscoverage['/tree/node.js'].lineData[444]++;
      self.el.setAttribute('aria-setsize', self.get('children').length);
    }
  }
  _$jscoverage['/tree/node.js'].lineData[449]++;
  function isNodeSingleOrLast(self) {
    _$jscoverage['/tree/node.js'].functionData[30]++;
    _$jscoverage['/tree/node.js'].lineData[450]++;
    var parent = self.get('parent'), children = visit53_451_1(parent && parent.get('children')), lastChild = visit54_452_1(children && children[children.length - 1]);
    _$jscoverage['/tree/node.js'].lineData[456]++;
    return visit55_456_1(!lastChild || visit56_456_2(lastChild === self));
  }
  _$jscoverage['/tree/node.js'].lineData[459]++;
  function isNodeLeaf(self) {
    _$jscoverage['/tree/node.js'].functionData[31]++;
    _$jscoverage['/tree/node.js'].lineData[460]++;
    var isLeaf = self.get('isLeaf');
    _$jscoverage['/tree/node.js'].lineData[462]++;
    return !(visit57_462_1(visit58_462_2(isLeaf === false) || (visit59_462_3(visit60_462_4(isLeaf === undefined) && self.get('children').length))));
  }
  _$jscoverage['/tree/node.js'].lineData[465]++;
  function getLastVisibleDescendant(self) {
    _$jscoverage['/tree/node.js'].functionData[32]++;
    _$jscoverage['/tree/node.js'].lineData[466]++;
    var children = self.get('children');
    _$jscoverage['/tree/node.js'].lineData[468]++;
    if (visit61_468_1(!self.get('expanded') || !children.length)) {
      _$jscoverage['/tree/node.js'].lineData[469]++;
      return self;
    }
    _$jscoverage['/tree/node.js'].lineData[472]++;
    return getLastVisibleDescendant(children[children.length - 1]);
  }
  _$jscoverage['/tree/node.js'].lineData[476]++;
  function getPreviousVisibleNode(self) {
    _$jscoverage['/tree/node.js'].functionData[33]++;
    _$jscoverage['/tree/node.js'].lineData[477]++;
    var prev = self.prev();
    _$jscoverage['/tree/node.js'].lineData[478]++;
    if (visit62_478_1(!prev)) {
      _$jscoverage['/tree/node.js'].lineData[479]++;
      prev = self.get('parent');
    } else {
      _$jscoverage['/tree/node.js'].lineData[481]++;
      prev = getLastVisibleDescendant(prev);
    }
    _$jscoverage['/tree/node.js'].lineData[483]++;
    return prev;
  }
  _$jscoverage['/tree/node.js'].lineData[487]++;
  function getNextVisibleNode(self) {
    _$jscoverage['/tree/node.js'].functionData[34]++;
    _$jscoverage['/tree/node.js'].lineData[488]++;
    var children = self.get('children'), n, parent;
    _$jscoverage['/tree/node.js'].lineData[491]++;
    if (visit63_491_1(self.get('expanded') && children.length)) {
      _$jscoverage['/tree/node.js'].lineData[492]++;
      return children[0];
    }
    _$jscoverage['/tree/node.js'].lineData[496]++;
    n = self.next();
    _$jscoverage['/tree/node.js'].lineData[497]++;
    parent = self;
    _$jscoverage['/tree/node.js'].lineData[498]++;
    while (visit64_498_1(!n && (parent = parent.get('parent')))) {
      _$jscoverage['/tree/node.js'].lineData[499]++;
      n = parent.next();
    }
    _$jscoverage['/tree/node.js'].lineData[501]++;
    return n;
  }
  _$jscoverage['/tree/node.js'].lineData[508]++;
  function refreshCss(self) {
    _$jscoverage['/tree/node.js'].functionData[35]++;
    _$jscoverage['/tree/node.js'].lineData[509]++;
    self.refreshCss(isNodeSingleOrLast(self), isNodeLeaf(self));
  }
  _$jscoverage['/tree/node.js'].lineData[512]++;
  function updateSubTreeStatus(self, c, depth, index) {
    _$jscoverage['/tree/node.js'].functionData[36]++;
    _$jscoverage['/tree/node.js'].lineData[513]++;
    var tree = self.get('tree');
    _$jscoverage['/tree/node.js'].lineData[514]++;
    if (visit65_514_1(tree)) {
      _$jscoverage['/tree/node.js'].lineData[515]++;
      recursiveSetDepth(tree, c, depth + 1);
      _$jscoverage['/tree/node.js'].lineData[516]++;
      refreshCssForSelfAndChildren(self, index);
    }
  }
  _$jscoverage['/tree/node.js'].lineData[520]++;
  function recursiveSetDepth(tree, c, setDepth) {
    _$jscoverage['/tree/node.js'].functionData[37]++;
    _$jscoverage['/tree/node.js'].lineData[521]++;
    if (visit66_521_1(setDepth !== undefined)) {
      _$jscoverage['/tree/node.js'].lineData[522]++;
      c.set('depth', setDepth);
    }
    _$jscoverage['/tree/node.js'].lineData[524]++;
    S.each(c.get('children'), function(child) {
  _$jscoverage['/tree/node.js'].functionData[38]++;
  _$jscoverage['/tree/node.js'].lineData[525]++;
  if (visit67_525_1(typeof setDepth === 'number')) {
    _$jscoverage['/tree/node.js'].lineData[526]++;
    recursiveSetDepth(tree, child, setDepth + 1);
  } else {
    _$jscoverage['/tree/node.js'].lineData[528]++;
    recursiveSetDepth(tree, child);
  }
});
  }
  _$jscoverage['/tree/node.js'].lineData[533]++;
  function refreshCssForSelfAndChildren(self, index) {
    _$jscoverage['/tree/node.js'].functionData[39]++;
    _$jscoverage['/tree/node.js'].lineData[534]++;
    refreshCss(self);
    _$jscoverage['/tree/node.js'].lineData[535]++;
    index = Math.max(0, index - 1);
    _$jscoverage['/tree/node.js'].lineData[536]++;
    var children = self.get('children'), c, len = children.length;
    _$jscoverage['/tree/node.js'].lineData[539]++;
    for (; visit68_539_1(index < len); index++) {
      _$jscoverage['/tree/node.js'].lineData[540]++;
      c = children[index];
      _$jscoverage['/tree/node.js'].lineData[541]++;
      refreshCss(c);
      _$jscoverage['/tree/node.js'].lineData[542]++;
      c.el.setAttribute('aria-posinset', index + 1);
    }
  }
});
