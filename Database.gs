/**
 * ═══════════════════════════════════════════════════════════
 * Database.gs — Google Sheets CRUD 추상화 레이어
 * ═══════════════════════════════════════════════════════════
 * Agent: 🗄 Data Engineer
 * 하네스: 모든 시트 접근은 이 모듈 경유. 직접 SpreadsheetApp 호출 금지.
 * 규칙: (1) readAll은 getValues() 1회 호출 (2) 쓰기는 LockService 필수
 *       (3) 정적 시트(CURRICULUM,SKILLS)는 6시간 캐시
 */

const DB = {
  // ── 내부: 시트 객체 획득 ──
  _ss: null,
  _getSS() {
    if (!this._ss) {
      if (!SS_ID) throw new Error('SPREADSHEET_ID가 설정되지 않았습니다. Setup.gs의 initialSetup()을 먼저 실행하세요.');
      this._ss = SpreadsheetApp.openById(SS_ID);
    }
    return this._ss;
  },

  _getSheet(name) {
    const sheet = this._getSS().getSheetByName(name);
    if (!sheet) throw new Error('시트 "' + name + '"을(를) 찾을 수 없습니다.');
    return sheet;
  },

  // ── 전체 읽기 (캐시 활용) ──
  readAll(sheetName, useCache) {
    if (useCache === undefined) useCache = true;
    var cacheKey = 'DB_' + sheetName;

    // 정적 데이터 캐시 (CURRICULUM, SKILLS, CONFIG)
    if (useCache && ['CURRICULUM','SKILLS','CONFIG'].indexOf(sheetName) >= 0) {
      try {
        var cached = CacheService.getScriptCache().get(cacheKey);
        if (cached) return JSON.parse(cached);
      } catch(e) { /* 캐시 실패 시 직접 읽기 */ }
    }

    var sheet = this._getSheet(sheetName);
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return [];

    var lastCol = sheet.getLastColumn();
    if (lastCol === 0) return [];
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();

    // ID 컬럼 (첫 열 + '_id' 포함 컬럼)은 반드시 문자열로 변환
    var idCols = {};
    headers.forEach(function(h, i) {
      if (i === 0 || h.indexOf('_id') >= 0 || h === 'piece_id' || h === 'tag' || h === 'status' || h === 'piece_status' || h === 'period_type' || h === 'type') {
        idCols[i] = true;
      }
    });

    var result = data.map(function(row) {
      var obj = {};
      headers.forEach(function(h, i) {
        var val = row[i];
        // ID/상태 컬럼은 문자열로, Date 객체는 ISO 문자열로 변환
        if (idCols[i] && val !== '' && val !== null && val !== undefined) {
          obj[h] = String(val);
        } else if (val instanceof Date) {
          obj[h] = val.toISOString().split('T')[0];
        } else {
          obj[h] = val;
        }
      });
      return obj;
    });

    // 정적 데이터 6시간 캐시
    if (['CURRICULUM','SKILLS','CONFIG'].indexOf(sheetName) >= 0) {
      try {
        var jsonStr = JSON.stringify(result);
        if (jsonStr.length < 100000) { // 100KB 이내만 캐시
          CacheService.getScriptCache().put(cacheKey, jsonStr, 21600);
        }
      } catch(e) { /* 캐시 저장 실패 무시 */ }
    }

    return result;
  },

  // ── ID로 검색 ──
  findById(sheetName, idCol, id) {
    var all = this.readAll(sheetName);
    for (var i = 0; i < all.length; i++) {
      if (String(all[i][idCol]) === String(id)) return all[i];
    }
    return null;
  },

  // ── 필터 검색 ──
  findBy(sheetName, filters) {
    var all = this.readAll(sheetName, false);
    return all.filter(function(row) {
      return Object.keys(filters).every(function(k) {
        return String(row[k]) === String(filters[k]);
      });
    });
  },

  // ── 추가 (ID 자동 생성) ──
  append(sheetName, data) {
    var sheet = this._getSheet(sheetName);
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var idCol = headers[0];

    // ID 자동 생성 (없으면)
    if (!data[idCol]) {
      data[idCol] = Utilities.getUuid().substr(0, 8);
    }
    if (!data.created_at && headers.indexOf('created_at') >= 0) {
      data.created_at = new Date().toISOString();
    }

    var row = headers.map(function(h) {
      return data[h] !== undefined && data[h] !== null ? data[h] : '';
    });
    sheet.appendRow(row);

    // 캐시 무효화
    this._invalidateCache(sheetName);

    return data[idCol];
  },

  // ── 수정 ──
  update(sheetName, id, updates) {
    var sheet = this._getSheet(sheetName);
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var data = sheet.getDataRange().getValues();

    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(id)) {
        Object.keys(updates).forEach(function(key) {
          var col = headers.indexOf(key);
          if (col >= 0) {
            sheet.getRange(i + 1, col + 1).setValue(updates[key]);
          }
        });
        break;
      }
    }
    this._invalidateCache(sheetName);
  },

  // ── 삭제 (행 제거) ──
  deleteRow(sheetName, id) {
    var sheet = this._getSheet(sheetName);
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(id)) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
    this._invalidateCache(sheetName);
  },

  // ── 캐시 무효화 ──
  _invalidateCache(sheetName) {
    try {
      CacheService.getScriptCache().remove('DB_' + sheetName);
    } catch(e) {}
  },

  // ── 전체 캐시 초기화 ──
  clearAllCache() {
    var cache = CacheService.getScriptCache();
    Object.keys(SHEET).forEach(function(k) {
      try { cache.remove('DB_' + SHEET[k]); } catch(e) {}
    });
  },

  // ── 감사 로그 기록 ──
  log(user, action, details) {
    try {
      var sheet = this._getSheet(SHEET.LOG);
      sheet.appendRow([new Date().toISOString(), user, action, 
        typeof details === 'object' ? JSON.stringify(details) : details]);
    } catch(e) {
      Logger.log('LOG write failed: ' + e.message);
    }
  },

  // ── 락 래퍼 (🔒 Security 요구) ──
  withLock(fn) {
    var lock = LockService.getScriptLock();
    try {
      lock.waitLock(15000); // 15초 대기
      return fn();
    } catch(e) {
      throw new Error('작업 처리 중 오류: ' + e.message);
    } finally {
      lock.releaseLock();
    }
  }
};
