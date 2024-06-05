const express = require('express');
const dns = require('dns').promises;

const app = express();
const PORT = 3000;

app.use(express.static('public'));

const formatRecords = (records) => records.flat().join('\n');

app.get('/check-dns', async (req, res) => {
    const domain = req.query.domain || 'google.com';
    const host = req.query.host || 'send';

    try {
        const txtRecordsResend = await dns.resolveTxt(`resend._domainkey.${domain}`).catch(() => []);
        const txtRecordsHost = await dns.resolveTxt(`${host}.${domain}`).catch(() => []);
        const mxRecords = await dns.resolveMx(`${host}.${domain}`).catch(() => []);
        const dmarcRecords = await dns.resolveTxt(`_dmarc.${domain}`).catch(() => []);

        res.json({
            txtRecordsResend: formatRecords(txtRecordsResend),
            txtRecordsHost: formatRecords(txtRecordsHost),
            mxRecords: formatRecords(mxRecords.map(record => `Priority: ${record.priority}`)),
            dmarcRecords: formatRecords(dmarcRecords)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
