import test from 'node:test';
import assert from 'node:assert/strict';
import { projectPublicView, renderProjectPage, publicHttpsUrl } from '../src/index.mjs';

const manifest = { schema_version: 'freedom.project/v1', kind: 'Project', project_id: 'project:example', name: 'Example project', summary: 'A source-only example.', repository: { visibility: 'public', full_name: 'example/project', html_url: 'https://github.com/example/project', repository_id: '42', source_lineage: [] }, data_boundary: { classification: 'public', customer_data_mode: 'none' }, description: { problem: 'Make a useful example.', audiences: ['Makers'], capabilities: ['Build a source page'], limitations: ['No official status verification'] }, page: { publication: 'github_pages', canonical_platform_url: 'https://staging.freetwai.com/' }, ownership: { accountable_team: null, external_owner: { login: 'example' }, security_contact: 'https://github.com/example/project/security' }, licensing: { spdx_expression: 'NOASSERTION', source_distribution: 'source_available' }, release: { policy: 'freedom.no-release/v1' }, links: { documentation: 'https://github.com/example/project', demo: null, support: null, issues: null } };

test('includes responsive layout CSS and structural grid for metadata cards', () => {
  const html = renderProjectPage(manifest);
  assert.match(html, /font-size:clamp\(2rem,5vw,3\.5rem\)/);
  assert.match(html, /max-width:960px/);
  assert.match(html, /grid-template-columns:repeat\(auto-fit,minmax\(min\(100%,300px\),1fr\)\)/);
  assert.match(html, /<div class="grid" id="capabilities_and_limitations">/);
});

test('renders basic project details, problem statement and audiences correctly', () => {
  const html = renderProjectPage(manifest);
  assert.match(html, /<h1>Example project<\/h1>/);
  assert.match(html, /<p>A source-only example\.<\/p>/);
  assert.match(html, /<p>Make a useful example\.<\/p>/);
  assert.match(html, /<li>Makers<\/li>/);
});

test('a public source artifact includes every required section and never trusts a requested label', () => {
  const source = { ...manifest, page: { ...manifest.page, requested_trust_label: 'official' } };
  const html = renderProjectPage(source);
  for (const section of ['identity_and_status', 'problem_and_audience', 'capabilities_and_limitations', 'links', 'release', 'ownership_and_security', 'license_and_data_boundary', 'fork_lineage', 'build_provenance', 'canonical_platform_link']) assert.match(html, new RegExp(`id="${section}"`));
  assert.equal(projectPublicView(source).official, false);
  assert.match(html, /Not verified/);
  assert.doesNotMatch(html, /<script/);
});
test('untrusted content is escaped and non-projected private fields do not leak', () => {
  const html = renderProjectPage({ ...manifest, name: '<img src=x onerror=alert(1)>', private_secret: 'DO_NOT_INCLUDE', description: { ...manifest.description, problem: '</p><script>alert(1)</script>' } });
  assert.match(html, /&lt;img/);
  assert.doesNotMatch(html, /<img|<script|DO_NOT_INCLUDE/);
});
test('private, internal and withheld metadata cannot generate public artifacts', () => {
  assert.throws(() => renderProjectPage({ ...manifest, repository: { ...manifest.repository, visibility: 'private' } }), /Private/);
  assert.throws(() => renderProjectPage({ ...manifest, data_boundary: { ...manifest.data_boundary, classification: 'internal' } }), /Private/);
  assert.throws(() => renderProjectPage({ ...manifest, page: { ...manifest.page, publication: 'withheld' } }), /does not request/);
});
test('unsafe navigational links, source paths and false provenance fail closed', () => {
  for (const url of ['javascript:alert(1)', 'https://user:pass@example.com', 'https://127.0.0.1/a', 'https://[::1]/', 'https://localhost/a', 'https://example.com/?token=abc', 'https://example.com\\@evil.com', 'https://project.internal/a']) assert.throws(() => publicHttpsUrl(url));
  assert.throws(() => renderProjectPage({ ...manifest, links: { demo: 'javascript:alert(1)' } }));
  assert.throws(() => renderProjectPage({ ...manifest, repository: { ...manifest.repository, full_name: '../../secret' } }), /inconsistent/);
  assert.throws(() => renderProjectPage(manifest, { sourceCommit: 'main' }), /full SHA/);
  assert.throws(() => renderProjectPage(manifest, { manifestSha256: 'trust-me' }), /SHA-256/);
});

test('escapeHtml covers all specific characters', () => {
  const html = renderProjectPage({ ...manifest, name: '& < > " \'' });
  assert.match(html, /&amp; &lt; &gt; &quot; &#39;/);
});

test('text function validation edge cases', () => {
  assert.throws(() => renderProjectPage({ ...manifest, name: '' }), /must be a bounded non-empty string/);
  assert.throws(() => renderProjectPage({ ...manifest, name: '   ' }), /must be a bounded non-empty string/);
  assert.throws(() => renderProjectPage({ ...manifest, name: 'a'.repeat(2001) }), /must be a bounded non-empty string/);
});

test('stringList function validation edge cases', () => {
  assert.throws(() => renderProjectPage({ ...manifest, description: { ...manifest.description, audiences: [] } }), /must be a bounded list/);
  assert.throws(() => renderProjectPage({ ...manifest, description: { ...manifest.description, audiences: 'not an array' } }), /must be a bounded list/);
  assert.throws(() => renderProjectPage({ ...manifest, description: { ...manifest.description, audiences: Array(41).fill('a') } }), /must be a bounded list/);
});

test('publicHttpsUrl function validation edge cases', () => {
  assert.throws(() => publicHttpsUrl('not a url'), /Invalid public URL/);
  assert.throws(() => publicHttpsUrl('ftp://example.com/'), /Only public HTTPS links without credentials are allowed/);
  assert.throws(() => publicHttpsUrl('https://%40@example.com/'), /Only public HTTPS links without credentials are allowed/);
  assert.throws(() => publicHttpsUrl('https://example.com?token=test'), /Credential-bearing URLs cannot appear in a public page/);

  // `publicHttpsUrl` optional chaining: if URL splits but missing something, fallback to ''
  // E.g. 'https://host%40/' doesn't work but we can pass 'https:/test'.
  // It shouldn't throw on `publicHttpsUrl('https:/example.com')` because URL constructor normalizes it.
  assert.equal(publicHttpsUrl('https:/example.com'), 'https://example.com/');
});

test('projectPublicView schema and basic manifest edge cases', () => {
  assert.throws(() => renderProjectPage({ ...manifest, schema_version: 'wrong/v1' }), /Expected a freedom.project\/v1 manifest/);
  assert.throws(() => renderProjectPage(undefined), /Expected a freedom.project\/v1 manifest/);
  assert.throws(() => renderProjectPage({ ...manifest, kind: 'NotProject' }), /Expected a freedom.project\/v1 manifest/);
  assert.throws(() => renderProjectPage({ ...manifest, project_id: 'invalid id' }), /Invalid project ID/);
  assert.throws(() => renderProjectPage({ ...manifest, project_id: '' }), /Invalid project ID/);
  assert.throws(() => renderProjectPage({ ...manifest, project_id: undefined }), /Invalid project ID/);
  assert.throws(() => renderProjectPage({ ...manifest, repository: { ...manifest.repository, full_name: 'invalid name' } }), /Repository identity is inconsistent/);
  assert.throws(() => renderProjectPage({ ...manifest, repository: { ...manifest.repository, html_url: 'https://github.com/example/other' } }), /Repository identity is inconsistent/);
  assert.throws(() => renderProjectPage({ ...manifest, repository: { ...manifest.repository, repository_id: 'not a number' } }), /Repository identity is inconsistent/);
  assert.throws(() => renderProjectPage({ ...manifest, repository: { ...manifest.repository, repository_id: '' } }), /Repository identity is inconsistent/);
  assert.throws(() => renderProjectPage({ ...manifest, repository: { ...manifest.repository, repository_id: undefined } }), /Repository identity is inconsistent/);
});

test('projectPublicView links edge cases', () => {
  assert.throws(() => renderProjectPage({ ...manifest, links: { unknown: 'https://example.com' } }), /Unknown public link/);
  const html = renderProjectPage({ ...manifest, links: { documentation: 'https://example.com/docs', demo: 'https://example.com/demo', support: 'https://example.com/support', issues: 'https://example.com/issues' } });
  assert.match(html, /https:\/\/example.com\/demo/);

  // `links` undefined defaults to {}
  const htmlNoLinks = renderProjectPage({ ...manifest, links: undefined });
  assert.doesNotMatch(htmlNoLinks, /<li><a/);
});

test('projectPublicView lineage edge cases', () => {
  assert.throws(() => renderProjectPage({ ...manifest, repository: { ...manifest.repository, source_lineage: 'not an array' } }), /Invalid source lineage/);
  assert.throws(() => renderProjectPage({ ...manifest, repository: { ...manifest.repository, source_lineage: Array(17).fill({}) } }), /Invalid source lineage/);
  const sourceWithLineage = { ...manifest, repository: { ...manifest.repository, source_lineage: [{ full_name: 'upstream/project', html_url: 'https://github.com/upstream/project', based_on_commit: '1234567890123456789012345678901234567890' }] } };
  const html = renderProjectPage(sourceWithLineage);
  assert.match(html, /upstream\/project/);
  assert.match(html, /1234567890123456789012345678901234567890/);

  // Lineage requires full SHA
  const sourceWithBadCommit = { ...manifest, repository: { ...manifest.repository, source_lineage: [{ full_name: 'upstream/project', html_url: 'https://github.com/upstream/project', based_on_commit: 'bad' }] } };
  assert.throws(() => renderProjectPage(sourceWithBadCommit), /Lineage requires a full SHA/);

  // Optional chaining lineage commit
  const sourceWithNoCommit = { ...manifest, repository: { ...manifest.repository, source_lineage: [{ full_name: 'upstream/project', html_url: 'https://github.com/upstream/project' }] } };
  assert.throws(() => renderProjectPage(sourceWithNoCommit), /Lineage requires a full SHA/);

  const sourceWithEmptyCommit = { ...manifest, repository: { ...manifest.repository, source_lineage: [{ full_name: 'upstream/project', html_url: 'https://github.com/upstream/project', based_on_commit: '' }] } };
  assert.throws(() => renderProjectPage(sourceWithEmptyCommit), /Lineage requires a full SHA/);

  // `source_lineage` undefined defaults to []
  const htmlNoLineage = renderProjectPage({ ...manifest, repository: { ...manifest.repository, source_lineage: undefined } });
  assert.match(htmlNoLineage, /No source lineage is declared/);
});
