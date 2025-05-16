const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');
const { auth } = require('../middleware/auth');

// Các route yêu cầu xác thực
router.get('/', auth, formController.getAllForms);
router.get('/:id', auth, formController.getFormById);
router.post('/', auth, formController.createForm);
router.put('/:id', auth, formController.updateForm);
router.delete('/:id', auth, formController.deleteForm);
router.get('/:id/responses', auth, formController.getFormResponses);
router.get('/:formId/responses/:responseId', auth, formController.getFormResponseById);
router.patch('/responses/:responseId', auth, formController.updateResponseStatus);
router.get('/:id/export', auth, formController.exportFormResponses);
router.post('/:id/update-response-count', auth, formController.updateFormResponseCount);

// Các route công khai
router.get('/public/:slug', formController.getPublicFormBySlug);
router.post('/public/:slug/submit', formController.submitFormResponse);

module.exports = router; 