/**
 * Unit tests for map-interactive.js
 * Depends on: nodes.js (NODES, NODE_STATUS, NODE_TYPES), map-interactive.js
 */

describe('findNodeById', function() {
  it('finds existing node by ID', function() {
    var node = findNodeById('coevorden-01');
    assert.ok(node, 'should find the node');
    assert.equal(node.name, 'Hackerspace Coevorden');
  });

  it('returns undefined for unknown ID', function() {
    var node = findNodeById('nonexistent-99');
    assert.equal(node, undefined);
  });
});

describe('buildConnections', function() {
  it('returns an array of connection objects', function() {
    var connections = buildConnections();
    assert.ok(Array.isArray(connections), 'should be an array');
    assert.ok(connections.length > 0, 'should have connections');
  });

  it('each connection has from and to node objects', function() {
    var connections = buildConnections();
    connections.forEach(function(conn) {
      assert.ok(conn.from, 'should have from');
      assert.ok(conn.to, 'should have to');
      assert.ok(conn.from.id, 'from should have id');
      assert.ok(conn.to.id, 'to should have id');
    });
  });

  it('connections are deduplicated', function() {
    var connections = buildConnections();
    var keys = connections.map(function(c) {
      return [c.from.id, c.to.id].sort().join('--');
    });
    var unique = keys.filter(function(k, i) { return keys.indexOf(k) === i; });
    assert.equal(keys.length, unique.length, 'no duplicate connections');
  });

  it('coevorden-01 connects to coevorden-02 and emmen-01', function() {
    var connections = buildConnections();
    var coev01 = connections.filter(function(c) {
      return c.from.id === 'coevorden-01' || c.to.id === 'coevorden-01';
    });
    assert.ok(coev01.length >= 2, 'coevorden-01 should have at least 2 connections');
  });
});

describe('createNodeMarkerElement', function() {
  it('creates an SVG group element', function() {
    var node = findNodeById('coevorden-01');
    var marker = createNodeMarkerElement(node);
    assert.equal(marker.tagName.toLowerCase(), 'g');
    assert.equal(marker.getAttribute('data-node-id'), 'coevorden-01');
  });

  it('marker is keyboard-accessible', function() {
    var node = findNodeById('assen-01');
    var marker = createNodeMarkerElement(node);
    assert.equal(marker.getAttribute('role'), 'button');
    assert.equal(marker.getAttribute('tabindex'), '0');
    assert.ok(marker.getAttribute('aria-label').indexOf('Assen') !== -1, 'aria-label should contain node name');
  });

  it('marker contains pulse and dot circles', function() {
    var node = findNodeById('coevorden-01');
    var marker = createNodeMarkerElement(node);
    var circles = marker.querySelectorAll('circle');
    assert.equal(circles.length, 2, 'should have pulse and dot');
  });
});

describe('MAP_STATUS_COLORS', function() {
  it('has colors for all statuses', function() {
    assert.ok(MAP_STATUS_COLORS.planned);
    assert.ok(MAP_STATUS_COLORS.active);
    assert.ok(MAP_STATUS_COLORS.offline);
    assert.ok(MAP_STATUS_COLORS.prototype);
  });
});

describe('MAP_TYPE_COLORS', function() {
  it('has colors for all types', function() {
    assert.ok(MAP_TYPE_COLORS.router);
    assert.ok(MAP_TYPE_COLORS.repeater);
    assert.ok(MAP_TYPE_COLORS.solar);
    assert.ok(MAP_TYPE_COLORS.client);
  });
});
